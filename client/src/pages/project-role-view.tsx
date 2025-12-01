import { useState, useEffect, useCallback, useRef } from "react";
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
  RefreshCw,
  GraduationCap,
  Handshake,
  ClipboardCheck,
  Copy
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, JobTheme } from "@shared/schema";
import { 
  VALUE_PILLARS, 
  SOLUTION_VALUE_PATTERNS, 
  LEADING_INDICATORS, 
  LAGGING_INDICATORS,
  HEALTH_SCORES,
  type ValuePillarId,
  type SolutionPatternId
} from "@shared/value-frameworks";
import { DemoModeButton } from "@/demo/DemoModeButton";
import { useDemoMode } from "@/demo/DemoModeContext";

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
  const [activeTab, setActiveTab] = useState(isSalesRoleParam ? "discover" : "health");
  const [isLogKPIOpen, setIsLogKPIOpen] = useState(false);
  
  // Reset tab when role changes
  useEffect(() => {
    if (isSalesRoleParam) {
      setActiveTab("discover");
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
  
  // Discovery workflow state - initialized from project data
  const [discoveryStep, setDiscoveryStepLocal] = useState<"theme-select" | "intelligence" | "questions" | "review" | "insights">("theme-select");
  const [buildValueSection, setBuildValueSection] = useState<"overview" | "commitments" | "stories">("overview");
  const [selectedDiscoveryTheme, setSelectedDiscoveryThemeLocal] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [discoveryCompleted, setDiscoveryCompletedLocal] = useState(false);
  const [discoveryProgressInitialized, setDiscoveryProgressInitialized] = useState(false);
  
  // Mutation to save discovery progress
  const saveDiscoveryProgressMutation = useMutation({
    mutationFn: async (data: { discoveryTheme?: string | null; discoveryStep?: string; discoveryCompleted?: boolean }) => {
      return await apiRequest("PATCH", `/api/projects/${projectId}/discovery-progress`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
    }
  });
  
  // Wrapper functions that save progress
  const setDiscoveryStep = (step: typeof discoveryStep) => {
    setDiscoveryStepLocal(step);
    saveDiscoveryProgressMutation.mutate({ discoveryStep: step });
  };
  
  const setSelectedDiscoveryTheme = (theme: string | null) => {
    setSelectedDiscoveryThemeLocal(theme);
    saveDiscoveryProgressMutation.mutate({ discoveryTheme: theme });
  };
  
  const setDiscoveryCompleted = (completed: boolean) => {
    setDiscoveryCompletedLocal(completed);
    saveDiscoveryProgressMutation.mutate({ discoveryCompleted: completed });
  };
  
  // Interactive Call Builder state (legacy - keeping for compatibility)
  const [callPhase, setCallPhase] = useState<"opening" | "discovery" | "support" | "closing">("opening");
  const [myCallFlow, setMyCallFlow] = useState<{id: number; question: string; phase: string; methodology?: string}[]>([]);
  const [activeMethodologyFilter, setActiveMethodologyFilter] = useState<string | null>(null);
  const [showCoachingTip, setShowCoachingTip] = useState(true);
  
  // Unified Narrative Canvas state - simplified storyboard
  const [narrativeCanvas, setNarrativeCanvas] = useState({
    opener: "",
    keyMessage: "",
    proofPoint: "",
    keyQuestions: [] as string[],
    callToAction: ""
  });
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [selectedQuestionMethodology, setSelectedQuestionMethodology] = useState<"all" | "spin" | "miller_heiman" | "pss">("all");
  
  // Enhanced questions with methodology and outcome info
  const [methodologyQuestions, setMethodologyQuestions] = useState<{
    question: string;
    methodology: "SPIN" | "Miller Heiman" | "PSS";
    stage: string;
    outcome: string;
    followUp?: string;
  }[]>([]);
  const [narrativeCanvasInitialized, setNarrativeCanvasInitialized] = useState(false);
  const [lastSavedNarrative, setLastSavedNarrative] = useState<string | null>(null);
  
  // Mutation to save narrative canvas
  const saveNarrativeCanvasMutation = useMutation({
    mutationFn: async (data: typeof narrativeCanvas) => {
      return await apiRequest("PATCH", `/api/projects/${projectId}/narrative-canvas`, data);
    },
    onSuccess: () => {
      setLastSavedNarrative(new Date().toLocaleTimeString());
    },
    onError: () => {
      setLastSavedNarrative(null); // Reset save indicator on error
      toast({ title: "Failed to save", description: "Your changes may not be saved. Please try again.", variant: "destructive" });
    }
  });
  
  // Store stable mutate reference in ref
  const mutateRef = useRef(saveNarrativeCanvasMutation.mutate);
  useEffect(() => {
    mutateRef.current = saveNarrativeCanvasMutation.mutate;
  }, [saveNarrativeCanvasMutation.mutate]);
  
  // Debounced auto-save for narrative canvas using useRef
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveNarrativeCanvasDebounced = useCallback((data: typeof narrativeCanvas) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      mutateRef.current(data);
    }, 1500);
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Enhanced Green Sheet state - Meeting Contact Context
  type BuyingRole = "economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion";
  type InfluenceLevel = "high" | "medium" | "low";
  
  const [meetingContact, setMeetingContact] = useState<{
    name: string;
    title: string;
    role: BuyingRole | null;
    influence: InfluenceLevel | null;
    knownConcerns: string;
    personalRapport: string;
    decisionCriteria: string;
  }>({
    name: "",
    title: "",
    role: null,
    influence: null,
    knownConcerns: "",
    personalRapport: "",
    decisionCriteria: ""
  });
  const [greenSheetEdits, setGreenSheetEdits] = useState({
    objective: "",
    desiredOutcome: "",
    openingStatement: "",
    bestActionCommitment: ""
  });
  const [isGreenSheetExpanded, setIsGreenSheetExpanded] = useState(true);
  
  // Contact Enrichment state
  const [showEnrichmentDialog, setShowEnrichmentDialog] = useState(false);
  const [enrichmentMethod, setEnrichmentMethod] = useState<"ai" | "linkedin" | "data">("ai");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [enrichmentResult, setEnrichmentResult] = useState<{
    suggestedTitle: string | null;
    suggestedRole: string | null;
    suggestedInfluence: string | null;
    background: string;
    likelyPriorities: string[];
    potentialConcerns: string[];
    rapportBuilders: string[];
    communicationStyle: string;
    decisionMakingStyle: string;
    recommendedApproach: string;
  } | null>(null);

  // Contact enrichment mutation
  const enrichContactMutation = useMutation({
    mutationFn: async (data: { contactName: string; title?: string; linkedInUrl?: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ai/enrich-contact`, data);
      return response.json();
    },
    onSuccess: (result) => {
      setEnrichmentResult(result);
      toast({
        title: "Contact researched",
        description: "AI has generated insights about this contact."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Research failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Apply enrichment results to meeting contact
  const applyEnrichment = () => {
    if (!enrichmentResult) return;
    
    setMeetingContact(prev => ({
      ...prev,
      title: enrichmentResult.suggestedTitle && !prev.title ? enrichmentResult.suggestedTitle : prev.title,
      role: (enrichmentResult.suggestedRole as BuyingRole) || prev.role,
      influence: (enrichmentResult.suggestedInfluence as InfluenceLevel) || prev.influence,
      knownConcerns: enrichmentResult.potentialConcerns.length > 0 
        ? (prev.knownConcerns ? prev.knownConcerns + "\n" : "") + enrichmentResult.potentialConcerns.join("; ")
        : prev.knownConcerns,
      personalRapport: enrichmentResult.rapportBuilders.length > 0
        ? (prev.personalRapport ? prev.personalRapport + "\n" : "") + enrichmentResult.rapportBuilders.join("; ")
        : prev.personalRapport
    }));
    
    setShowEnrichmentDialog(false);
    toast({
      title: "Insights applied",
      description: "Contact fields have been updated with AI research."
    });
  };
  
  // Role-based coaching guidance
  const roleCoaching: Record<BuyingRole, string> = {
    economic_buyer: "Focus on ROI, business impact, and strategic alignment. This person controls the budget—speak to outcomes and value, not features.",
    user_buyer: "Emphasize ease of implementation, day-to-day impact, and how this makes their life easier. They care about practical outcomes.",
    technical_buyer: "Be prepared for detailed questions. Have data, methodology, and proof points ready. They'll screen for fit and feasibility.",
    coach: "Ask for inside information on the buying process. Who else needs to be involved? What concerns should you address proactively?",
    champion: "Equip them to sell internally. Give them the soundbites, data, and stories they can share with others."
  };
  
  // Interactive Story Builder state
  const [storyBuilderOpen, setStoryBuilderOpen] = useState(false);
  const [activeStoryPhase, setActiveStoryPhase] = useState<"before" | "during" | "after">("before");
  const [storyDraft, setStoryDraft] = useState({
    // BEFORE - Crafting
    singleMessage: "",
    emotionalReaction: "",
    startingHook: "",
    structure: "situation-struggle-insight-outcome",
    heroCharacter: "",
    evidence: "",
    movingQuestion: "",
    // DURING - Telling
    openingLine: "",
    turningPoint: "",
    keyDataPoint: "",
    // AFTER - Landing
    meaningMoment: "",
    takeaway: "",
    callToAction: ""
  });
  const [storyTestResults, setStoryTestResults] = useState<{
    strangerCare: boolean | null;
    simpleEnough: boolean | null;
    revealsMeaning: boolean | null;
  }>({
    strangerCare: null,
    simpleEnough: null,
    revealsMeaning: null
  });
  
  // Reset story test when phase changes
  useEffect(() => {
    if (activeStoryPhase !== "after") {
      setStoryTestResults({ strangerCare: null, simpleEnough: null, revealsMeaning: null });
    }
  }, [activeStoryPhase]);
  
  // AI Story Suggestions state
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState<string | null>(null);
  const [aiSuggestionReasoning, setAiSuggestionReasoning] = useState<string>("");
  
  // AI Story Suggestion mutation
  const storySuggestionMutation = useMutation({
    mutationFn: async ({ fieldToSuggest, phase, stories }: { 
      fieldToSuggest: string; 
      phase: "before" | "during" | "after";
      stories?: Array<{ client: string; industry: string; challenge: string; metrics: string[] }>;
    }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ai/story-suggestion`, {
        meetingContact: {
          name: meetingContact.name,
          title: meetingContact.title,
          role: meetingContact.role,
          influence: meetingContact.influence,
          knownConcerns: meetingContact.knownConcerns,
          decisionCriteria: meetingContact.decisionCriteria
        },
        discoveryTheme: selectedDiscoveryTheme || "General business consulting",
        successStories: stories || [],
        currentDraft: {
          singleMessage: storyDraft.singleMessage,
          emotionalReaction: storyDraft.emotionalReaction,
          startingHook: storyDraft.startingHook,
          structure: storyDraft.structure,
          heroCharacter: storyDraft.heroCharacter,
          evidence: storyDraft.evidence
        },
        fieldToSuggest,
        phase
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.suggestions) {
        setStoryDraft(prev => ({
          ...prev,
          ...data.suggestions
        }));
        setAiSuggestionReasoning(data.reasoning || "");
      }
      setAiSuggestionLoading(null);
    },
    onError: (error: any) => {
      toast({
        title: "AI Suggestion Failed",
        description: error.message || "Could not generate suggestions. Please try again.",
        variant: "destructive"
      });
      setAiSuggestionLoading(null);
    }
  });
  
  const handleAiSuggestWithStories = (fieldToSuggest: string, stories: Array<{ client: string; industry: string; challenge: string; metrics: string[] }>) => {
    setAiSuggestionLoading(fieldToSuggest);
    setAiSuggestionReasoning("");
    storySuggestionMutation.mutate({ fieldToSuggest, phase: activeStoryPhase, stories });
  };
  
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

  // Commitments for workflow progress tracking
  const { data: commitments = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", projectId, "commitments"],
    enabled: projectId > 0
  });

  // Handoff packets for workflow progress tracking
  const { data: handoffPackets = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", projectId, "handoffs"],
    enabled: projectId > 0
  });

  // AI-suggested KPIs from discovery insights with enhanced benchmarks
  type DiscoveryKpiSuggestion = {
    kpiName: string;
    kpiType: "primary" | "supporting";
    unit: string;
    definition: string;
    strategicRationale: string;
    valuePillar: "Grow" | "Optimise" | "De-risk" | "Strengthen Capability";
    baselineEstimate: string;
    targetEstimate: string;
    baselineReasoning?: string;
    industryBenchmark?: {
      low: string;
      median: string;
      high: string;
      source: string;
    };
    kornFerryBenchmark?: {
      topQuartile: string;
      typical: string;
      context: string;
    };
    achievabilityScore: number;
    valueImpactScore: number;
    sourceInsightTitle: string;
  };

  const [aiKpiSuggestions, setAiKpiSuggestions] = useState<DiscoveryKpiSuggestion[]>([]);
  const [aiKpiLoading, setAiKpiLoading] = useState(false);
  const [aiKpiError, setAiKpiError] = useState<string | null>(null);
  const [prefillSuggestion, setPrefillSuggestion] = useState<DiscoveryKpiSuggestion | null>(null);
  const [selectedKpiSuggestions, setSelectedKpiSuggestions] = useState<Set<number>>(new Set());

  // Function to generate AI KPI suggestions from discovery
  const generateAiKpiSuggestions = async () => {
    if (aiKpiLoading) return;
    setAiKpiLoading(true);
    setAiKpiError(null);
    
    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/discovery-kpi-suggestions`, {});
      const data = await response.json();
      
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiKpiSuggestions(data.suggestions);
        toast({
          title: "AI Suggestions Ready",
          description: `Generated ${data.suggestions.length} outcome recommendations based on ${data.insightsCount} discovery insights`
        });
      }
    } catch (error: any) {
      console.error("Failed to generate AI outcome suggestions:", error);
      setAiKpiError(error.message || "Failed to generate suggestions");
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Could not generate AI suggestions"
      });
    } finally {
      setAiKpiLoading(false);
    }
  };

  // Handler to add an AI suggestion as an Outcome commitment (pre-fills form)
  const handleAddSuggestionAsCommitment = (suggestion: DiscoveryKpiSuggestion) => {
    setPrefillSuggestion(suggestion);
    setBuildValueSection("commitments");
    toast({
      title: "Ready to Create Outcome",
      description: `Form pre-filled with "${suggestion.kpiName}" - review and confirm`
    });
  };

  // Multi-select handlers for batch KPI addition
  const toggleKpiSelection = (idx: number) => {
    setSelectedKpiSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const selectAllKpis = () => {
    setSelectedKpiSuggestions(new Set(aiKpiSuggestions.map((_, idx) => idx)));
  };

  const deselectAllKpis = () => {
    setSelectedKpiSuggestions(new Set());
  };

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
  
  // Initialize discovery progress from project data
  useEffect(() => {
    if (project && !discoveryProgressInitialized) {
      // Restore saved state
      if (project.discoveryStep) {
        setDiscoveryStepLocal(project.discoveryStep as typeof discoveryStep);
      }
      if (project.discoveryTheme) {
        setSelectedDiscoveryThemeLocal(project.discoveryTheme);
      }
      if (project.discoveryCompleted) {
        setDiscoveryCompletedLocal(project.discoveryCompleted);
      }
      setDiscoveryProgressInitialized(true);
    }
  }, [project, discoveryProgressInitialized]);
  
  // Initialize narrative canvas from project data
  useEffect(() => {
    if (project && !narrativeCanvasInitialized) {
      const savedCanvas = (project as any).narrativeCanvas;
      if (savedCanvas) {
        setNarrativeCanvas({
          opener: savedCanvas.opener || "",
          keyMessage: savedCanvas.keyMessage || "",
          proofPoint: savedCanvas.proofPoint || "",
          keyQuestions: savedCanvas.keyQuestions || [],
          callToAction: savedCanvas.callToAction || ""
        });
        if (savedCanvas.lastUpdated) {
          setLastSavedNarrative(new Date(savedCanvas.lastUpdated).toLocaleTimeString());
        }
      }
      setNarrativeCanvasInitialized(true);
    }
  }, [project, narrativeCanvasInitialized]);
  
  // Auto-save narrative canvas when content changes (after initial load)
  useEffect(() => {
    if (narrativeCanvasInitialized && (
      narrativeCanvas.opener || 
      narrativeCanvas.keyMessage || 
      narrativeCanvas.proofPoint || 
      narrativeCanvas.keyQuestions.length > 0 || 
      narrativeCanvas.callToAction
    )) {
      saveNarrativeCanvasDebounced(narrativeCanvas);
    }
  }, [narrativeCanvas, narrativeCanvasInitialized, saveNarrativeCanvasDebounced]);

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

  const groupedQuestions = (discoveryQuestions || []).reduce((acc, q) => {
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
      toast({ title: "Outcome logged", description: "Measurement recorded successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to log outcome." });
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

  // Value Agreement Tab Component
  const ValueAgreementTab = ({ 
    projectId, 
    project, 
    insights, 
    kpis, 
    jobThemes,
    prefillSuggestion,
    onPrefillUsed
  }: { 
    projectId: number; 
    project: Project; 
    insights: ProjectInsight[]; 
    kpis: KPI[]; 
    jobThemes: JobTheme[];
    prefillSuggestion?: {
      kpiName: string;
      kpiType: "primary" | "supporting";
      unit: string;
      definition: string;
      strategicRationale: string;
      valuePillar: "Grow" | "Optimise" | "De-risk" | "Strengthen Capability";
      baselineEstimate: string;
      targetEstimate: string;
      sourceInsightTitle: string;
    } | null;
    onPrefillUsed?: () => void;
  }) => {
    const [isAddCommitmentOpen, setIsAddCommitmentOpen] = useState(false);
    const [editingCommitment, setEditingCommitment] = useState<any>(null);
    const [newCommitment, setNewCommitment] = useState({
      name: "",
      description: "",
      kpiUnit: "",
      baselineValue: "",
      targetValue: "",
      targetDate: "",
      estimatedAnnualValue: "",
      strategicPillarId: null as number | null,
      pillarObjectiveId: null as number | null,
      linkedDiscoveryTheme: null as string | null,
      rationale: "",
      valuePillar: null as ValuePillarId | null,
      solutionPattern: null as SolutionPatternId | null,
      selectedKpiTemplate: null as string | null,
      sourceAiSuggestion: null as {
        sourceInsightTitle: string;
        kpiType: "primary" | "supporting";
        generatedAt: string;
      } | null,
    });

    // Effect to handle prefill from AI suggestions
    useEffect(() => {
      if (prefillSuggestion) {
        // Map value pillar string to ValuePillarId
        const pillarMap: Record<string, ValuePillarId> = {
          "Grow": "grow",
          "Optimise": "optimise",
          "De-risk": "derisk",
          "Strengthen Capability": "strengthen"
        };
        
        setNewCommitment({
          name: prefillSuggestion.kpiName,
          description: prefillSuggestion.definition,
          kpiUnit: prefillSuggestion.unit,
          baselineValue: prefillSuggestion.baselineEstimate.replace(/[^0-9.-]/g, ''),
          targetValue: prefillSuggestion.targetEstimate.replace(/[^0-9.-]/g, ''),
          targetDate: "",
          estimatedAnnualValue: "",
          strategicPillarId: null,
          pillarObjectiveId: null,
          linkedDiscoveryTheme: prefillSuggestion.sourceInsightTitle,
          rationale: prefillSuggestion.strategicRationale,
          valuePillar: pillarMap[prefillSuggestion.valuePillar] || null,
          solutionPattern: null,
          selectedKpiTemplate: null,
          sourceAiSuggestion: {
            sourceInsightTitle: prefillSuggestion.sourceInsightTitle,
            kpiType: prefillSuggestion.kpiType,
            generatedAt: new Date().toISOString(),
          },
        });
        setIsAddCommitmentOpen(true);
        onPrefillUsed?.();
      }
    }, [prefillSuggestion, onPrefillUsed]);

    // Fetch commitments
    const { data: commitments = [], isLoading: commitmentsLoading } = useQuery({
      queryKey: ["/api/projects", projectId, "commitments"],
    });

    // Fetch strategic pillars for this account
    const { data: strategicPillars = [] } = useQuery({
      queryKey: ["/api/accounts", project.accountId, "strategic-pillars"],
      enabled: !!project.accountId,
    });

    // Fetch pillar objectives when a pillar is selected
    const { data: pillarObjectives = [] } = useQuery({
      queryKey: ["/api/strategic-pillars", newCommitment.strategicPillarId, "objectives"],
      enabled: !!newCommitment.strategicPillarId,
    });

    // Create commitment mutation
    const createCommitmentMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", `/api/projects/${projectId}/commitments`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        setIsAddCommitmentOpen(false);
        resetNewCommitment();
        toast({ title: "Outcome Added", description: "Outcome has been added to your selection." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to add outcome." });
      }
    });

    // Update commitment mutation
    const updateCommitmentMutation = useMutation({
      mutationFn: async ({ id, data }: { id: number; data: any }) => {
        const response = await apiRequest("PATCH", `/api/projects/${projectId}/commitments/${id}`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        setEditingCommitment(null);
        toast({ title: "Outcome Updated", description: "Changes have been saved." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to update outcome." });
      }
    });

    // Submit for client review
    const submitForReviewMutation = useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("PATCH", `/api/projects/${projectId}/commitments/${id}`, {
          status: "proposed"
        });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        toast({ title: "Submitted for review", description: "Client can now review this outcome." });
      }
    });

    // Client confirm commitment
    const confirmCommitmentMutation = useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("PATCH", `/api/projects/${projectId}/commitments/${id}/confirm`, {});
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        toast({ title: "Outcome Confirmed", description: "Client has confirmed this outcome." });
      }
    });

    // Delete commitment
    const deleteCommitmentMutation = useMutation({
      mutationFn: async (id: number) => {
        await apiRequest("DELETE", `/api/projects/${projectId}/commitments/${id}`, undefined);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        toast({ title: "Outcome Removed", description: "The outcome has been removed." });
      }
    });

    const resetNewCommitment = () => {
      setNewCommitment({
        name: "",
        description: "",
        kpiUnit: "",
        baselineValue: "",
        targetValue: "",
        targetDate: "",
        estimatedAnnualValue: "",
        strategicPillarId: null,
        pillarObjectiveId: null,
        linkedDiscoveryTheme: null,
        rationale: "",
        valuePillar: null,
        solutionPattern: null,
        selectedKpiTemplate: null,
        sourceAiSuggestion: null,
      });
    };

    // Get recommended KPIs based on solution pattern
    const getRecommendedKPIs = () => {
      if (!newCommitment.solutionPattern) return { leading: [], lagging: [] };
      const pattern = SOLUTION_VALUE_PATTERNS[newCommitment.solutionPattern];
      return {
        leading: pattern.recommendedKPIs.leading.map(id => LEADING_INDICATORS[id as keyof typeof LEADING_INDICATORS]).filter(Boolean),
        lagging: pattern.recommendedKPIs.lagging.map(id => LAGGING_INDICATORS[id as keyof typeof LAGGING_INDICATORS]).filter(Boolean),
      };
    };

    // Apply KPI template to form
    const applyKpiTemplate = (kpiId: string, type: 'leading' | 'lagging') => {
      const kpi = type === 'leading' 
        ? LEADING_INDICATORS[kpiId as keyof typeof LEADING_INDICATORS]
        : LAGGING_INDICATORS[kpiId as keyof typeof LAGGING_INDICATORS];
      
      if (kpi) {
        setNewCommitment(prev => ({
          ...prev,
          name: kpi.name,
          description: kpi.description,
          kpiUnit: kpi.unit,
          valuePillar: kpi.pillar as ValuePillarId,
          selectedKpiTemplate: kpiId,
        }));
      }
    };

    const handleCreateCommitment = () => {
      createCommitmentMutation.mutate({
        name: newCommitment.name,
        description: newCommitment.description || null,
        kpiUnit: newCommitment.kpiUnit || null,
        baselineValue: newCommitment.baselineValue ? parseFloat(newCommitment.baselineValue) : null,
        targetValue: newCommitment.targetValue ? parseFloat(newCommitment.targetValue) : null,
        targetDate: newCommitment.targetDate ? new Date(newCommitment.targetDate) : null,
        estimatedAnnualValue: newCommitment.estimatedAnnualValue ? parseFloat(newCommitment.estimatedAnnualValue) : null,
        strategicPillarId: newCommitment.strategicPillarId,
        pillarObjectiveId: newCommitment.pillarObjectiveId,
        linkedDiscoveryTheme: newCommitment.linkedDiscoveryTheme,
        rationale: newCommitment.rationale || null,
        valuePillar: newCommitment.valuePillar,
        solutionPattern: newCommitment.solutionPattern,
        status: "draft",
        definedBy: "Sales Team",
        provenance: newCommitment.sourceAiSuggestion ? {
          source: "ai_generated",
          sourceInsightTitle: newCommitment.sourceAiSuggestion.sourceInsightTitle,
          kpiType: newCommitment.sourceAiSuggestion.kpiType,
          generatedAt: newCommitment.sourceAiSuggestion.generatedAt,
        } : null,
      });
    };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "draft":
          return <Badge variant="secondary">Draft</Badge>;
        case "proposed":
          return <Badge className="bg-blue-500/10 text-blue-600">Pending Client Review</Badge>;
        case "client_confirmed":
          return <Badge className="bg-emerald-500/10 text-emerald-600">Client Confirmed</Badge>;
        case "handed_off":
          return <Badge className="bg-purple-500/10 text-purple-600">Handed Off</Badge>;
        case "in_delivery":
          return <Badge className="bg-cyan-500/10 text-cyan-600">In Delivery</Badge>;
        case "completed":
          return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

    const getValuePillarBadge = (pillar: string | null) => {
      if (!pillar) return null;
      const pillarData = VALUE_PILLARS[pillar as ValuePillarId];
      if (!pillarData) return null;
      
      const colorMap: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        blue: "bg-blue-500/10 text-blue-600 border-blue-500/30",
        amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        violet: "bg-violet-500/10 text-violet-600 border-violet-500/30",
      };
      
      return (
        <Badge className={`${colorMap[pillarData.color]} border text-xs`}>
          {pillarData.name}
        </Badge>
      );
    };

    const getHealthStatusBadge = (healthStatus: string | null) => {
      if (!healthStatus) return null;
      const health = HEALTH_SCORES[healthStatus as keyof typeof HEALTH_SCORES];
      if (!health) return null;
      
      const colorMap: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600",
        amber: "bg-amber-500/10 text-amber-600",
        red: "bg-red-500/10 text-red-600",
        slate: "bg-slate-500/10 text-slate-600",
      };
      
      return (
        <Badge className={`${colorMap[health.color]} text-xs`}>
          {health.label}
        </Badge>
      );
    };

    const draftCommitments = (commitments as any[]).filter(c => c.status === "draft");
    const proposedCommitments = (commitments as any[]).filter(c => c.status === "proposed");
    const confirmedCommitments = (commitments as any[]).filter(c => c.status === "client_confirmed" || c.status === "handed_off");
    const inDeliveryCommitments = (commitments as any[]).filter(c => c.status === "in_delivery" || c.status === "completed");
    const totalCommittedValue = (commitments as any[]).reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
    const confirmedValue = confirmedCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Handshake className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Outcome Selection</CardTitle>
                  <CardDescription>
                    Select and track outcomes with your client that link to their strategic objectives
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setIsAddCommitmentOpen(true)} data-testid="button-add-commitment">
                <Plus className="w-4 h-4 mr-2" />
                Add Outcome
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Outcomes</p>
                <p className="text-2xl font-bold">{(commitments as any[]).length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Client Confirmed</p>
                <p className="text-2xl font-bold text-emerald-600">{confirmedCommitments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">{proposedCommitments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Outcome Value</p>
                <p className="text-2xl font-bold text-violet-600">
                  ${(confirmedValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outcome Pipeline */}
        <div className="grid gap-6 lg:grid-cols-3" data-demo-step="kpi-pipeline">
          {/* Draft */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Draft Outcomes
                <Badge variant="secondary" className="ml-auto">{draftCommitments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {draftCommitments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No draft outcomes</p>
              ) : (
                draftCommitments.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg border hover-elevate" data-testid={`commitment-draft-${c.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{c.name}</h4>
                      <div className="flex flex-wrap gap-1 items-center">
                        {c.provenance?.source === "ai_generated" && (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] px-1.5">
                            <Sparkles className="w-3 h-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                        {getValuePillarBadge(c.valuePillar)}
                        {getStatusBadge(c.status)}
                      </div>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {c.baselineValue !== null && c.targetValue !== null && (
                        <span>{c.baselineValue} → {c.targetValue} {c.kpiUnit || ""}</span>
                      )}
                      {c.estimatedAnnualValue && (
                        <span className="text-violet-600 font-medium">
                          ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setEditingCommitment(c)}
                        data-testid={`button-edit-commitment-${c.id}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => submitForReviewMutation.mutate(c.id)}
                        disabled={submitForReviewMutation.isPending}
                        data-testid={`button-submit-review-${c.id}`}
                      >
                        Submit for Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pending Review */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Pending Review
                <Badge className="ml-auto bg-blue-500/10 text-blue-600">{proposedCommitments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proposedCommitments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No outcomes pending review</p>
              ) : (
                proposedCommitments.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5" data-testid={`commitment-review-${c.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{c.name}</h4>
                      <div className="flex flex-wrap gap-1 items-center">
                        {c.provenance?.source === "ai_generated" && (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] px-1.5">
                            <Sparkles className="w-3 h-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                        {getValuePillarBadge(c.valuePillar)}
                        {getStatusBadge(c.status)}
                      </div>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {c.baselineValue !== null && c.targetValue !== null && (
                        <span>{c.baselineValue} → {c.targetValue} {c.kpiUnit || ""}</span>
                      )}
                      {c.estimatedAnnualValue && (
                        <span className="text-violet-600 font-medium">
                          ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => confirmCommitmentMutation.mutate(c.id)}
                      disabled={confirmCommitmentMutation.isPending}
                      data-testid={`button-confirm-commitment-${c.id}`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Client Confirmed
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Confirmed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Confirmed Outcomes
                <Badge className="ml-auto bg-emerald-500/10 text-emerald-600">{confirmedCommitments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {confirmedCommitments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No confirmed outcomes yet</p>
              ) : (
                confirmedCommitments.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5" data-testid={`commitment-confirmed-${c.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{c.name}</h4>
                      <div className="flex flex-wrap gap-1 items-center">
                        {c.provenance?.source === "ai_generated" && (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] px-1.5">
                            <Sparkles className="w-3 h-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                        {getValuePillarBadge(c.valuePillar)}
                        {getHealthStatusBadge(c.healthStatus)}
                        {getStatusBadge(c.status)}
                      </div>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {c.baselineValue !== null && c.targetValue !== null && (
                        <span>{c.baselineValue} → {c.targetValue} {c.kpiUnit || ""}</span>
                      )}
                      {c.estimatedAnnualValue && (
                        <span className="text-emerald-600 font-medium">
                          ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                        </span>
                      )}
                    </div>
                    {c.clientConfirmedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Confirmed: {new Date(c.clientConfirmedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ready for Handoff Summary */}
        {confirmedCommitments.length > 0 && (
          <Card className="bg-gradient-to-r from-emerald-500/5 to-violet-500/5 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                Ready for CSM Handoff
              </CardTitle>
              <CardDescription>
                {confirmedCommitments.length} outcome(s) confirmed and ready to be handed off to delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Outcome Value</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${(confirmedValue / 1000000).toFixed(2)}M
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab("handoff")}
                  data-testid="button-go-to-handoff"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Proceed to Handoff
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Outcome Dialog */}
        <Dialog open={isAddCommitmentOpen} onOpenChange={setIsAddCommitmentOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Outcome</DialogTitle>
              <DialogDescription>
                Define a measurable outcome with benchmarks to track with the client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Value Framework Selection */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/5 to-blue-500/5 border border-violet-500/20 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="font-medium text-sm">Value Framework</span>
                </div>
                
                {/* Value Pillar Selection */}
                <div className="space-y-2">
                  <Label>Value Pillar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(VALUE_PILLARS).map(([id, pillar]) => (
                      <button
                        key={id}
                        type="button"
                        className={`p-3 rounded-lg border text-left transition-all ${
                          newCommitment.valuePillar === id 
                            ? `border-${pillar.color}-500 bg-${pillar.color}-500/10` 
                            : "border-muted hover-elevate"
                        }`}
                        onClick={() => setNewCommitment({ ...newCommitment, valuePillar: id as ValuePillarId })}
                        data-testid={`pillar-${id}`}
                      >
                        <div className="font-medium text-sm">{pillar.name}</div>
                        <div className="text-xs text-muted-foreground">{pillar.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solution Pattern Selection */}
                <div className="space-y-2">
                  <Label>Solution Pattern</Label>
                  <Select 
                    value={newCommitment.solutionPattern || ""}
                    onValueChange={(val) => setNewCommitment({ 
                      ...newCommitment, 
                      solutionPattern: val as SolutionPatternId 
                    })}
                  >
                    <SelectTrigger data-testid="select-solution-pattern">
                      <SelectValue placeholder="Select a solution pattern for outcome suggestions" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOLUTION_VALUE_PATTERNS).map(([id, pattern]) => (
                        <SelectItem key={id} value={id}>
                          <div className="flex flex-col">
                            <span>{pattern.name}</span>
                            <span className="text-xs text-muted-foreground">{pattern.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* KPI Suggestions based on Solution Pattern */}
                {newCommitment.solutionPattern && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Suggested Outcomes
                    </Label>
                    <div className="grid gap-2">
                      <div className="text-xs font-medium text-muted-foreground">Leading Indicators</div>
                      <div className="flex flex-wrap gap-2">
                        {getRecommendedKPIs().leading.map((kpi: any) => (
                          <Badge 
                            key={kpi.id} 
                            variant={newCommitment.selectedKpiTemplate === kpi.id ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => applyKpiTemplate(kpi.id, 'leading')}
                          >
                            {kpi.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Lagging Indicators</div>
                      <div className="flex flex-wrap gap-2">
                        {getRecommendedKPIs().lagging.map((kpi: any) => (
                          <Badge 
                            key={kpi.id}
                            variant={newCommitment.selectedKpiTemplate === kpi.id ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => applyKpiTemplate(kpi.id, 'lagging')}
                          >
                            {kpi.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commitment-name">Commitment Name *</Label>
                <Input
                  id="commitment-name"
                  placeholder="e.g., Reduce time-to-hire by 30%"
                  value={newCommitment.name}
                  onChange={(e) => setNewCommitment({ ...newCommitment, name: e.target.value })}
                  data-testid="input-commitment-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commitment-description">Description</Label>
                <Textarea
                  id="commitment-description"
                  placeholder="Describe what this commitment entails..."
                  value={newCommitment.description}
                  onChange={(e) => setNewCommitment({ ...newCommitment, description: e.target.value })}
                  data-testid="input-commitment-description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="commitment-baseline">Baseline Value</Label>
                  <Input
                    id="commitment-baseline"
                    type="number"
                    placeholder="Current state"
                    value={newCommitment.baselineValue}
                    onChange={(e) => setNewCommitment({ ...newCommitment, baselineValue: e.target.value })}
                    data-testid="input-commitment-baseline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commitment-target">Target Value</Label>
                  <Input
                    id="commitment-target"
                    type="number"
                    placeholder="Goal"
                    value={newCommitment.targetValue}
                    onChange={(e) => setNewCommitment({ ...newCommitment, targetValue: e.target.value })}
                    data-testid="input-commitment-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commitment-unit">Unit</Label>
                  <Input
                    id="commitment-unit"
                    placeholder="e.g., days, %, $"
                    value={newCommitment.kpiUnit}
                    onChange={(e) => setNewCommitment({ ...newCommitment, kpiUnit: e.target.value })}
                    data-testid="input-commitment-unit"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commitment-target-date">Target Date</Label>
                  <Input
                    id="commitment-target-date"
                    type="date"
                    value={newCommitment.targetDate}
                    onChange={(e) => setNewCommitment({ ...newCommitment, targetDate: e.target.value })}
                    data-testid="input-commitment-target-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commitment-value">Estimated Annual Value ($)</Label>
                  <Input
                    id="commitment-value"
                    type="number"
                    placeholder="e.g., 500000"
                    value={newCommitment.estimatedAnnualValue}
                    onChange={(e) => setNewCommitment({ ...newCommitment, estimatedAnnualValue: e.target.value })}
                    data-testid="input-commitment-value"
                  />
                </div>
              </div>

              {/* Strategic Pillar Linking */}
              {(strategicPillars as any[]).length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Strategic Pillar</Label>
                  <Select 
                    value={newCommitment.strategicPillarId?.toString() || ""}
                    onValueChange={(val) => setNewCommitment({ 
                      ...newCommitment, 
                      strategicPillarId: val ? parseInt(val) : null,
                      pillarObjectiveId: null
                    })}
                  >
                    <SelectTrigger data-testid="select-strategic-pillar">
                      <SelectValue placeholder="Select a strategic pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      {(strategicPillars as any[]).map((pillar: any) => (
                        <SelectItem key={pillar.id} value={pillar.id.toString()}>
                          {pillar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pillar Objective Linking */}
              {newCommitment.strategicPillarId && (pillarObjectives as any[]).length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Pillar Objective</Label>
                  <Select 
                    value={newCommitment.pillarObjectiveId?.toString() || ""}
                    onValueChange={(val) => setNewCommitment({ 
                      ...newCommitment, 
                      pillarObjectiveId: val ? parseInt(val) : null 
                    })}
                  >
                    <SelectTrigger data-testid="select-pillar-objective">
                      <SelectValue placeholder="Select an objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {(pillarObjectives as any[]).map((obj: any) => (
                        <SelectItem key={obj.id} value={obj.id.toString()}>
                          {obj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Discovery Theme Linking */}
              {jobThemes.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Discovery Theme</Label>
                  <Select 
                    value={newCommitment.linkedDiscoveryTheme || ""}
                    onValueChange={(val) => setNewCommitment({ 
                      ...newCommitment, 
                      linkedDiscoveryTheme: val || null 
                    })}
                  >
                    <SelectTrigger data-testid="select-discovery-theme">
                      <SelectValue placeholder="Select a discovery theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobThemes.map((theme: any) => (
                        <SelectItem key={theme.id} value={theme.name}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="commitment-rationale">Rationale</Label>
                <Textarea
                  id="commitment-rationale"
                  placeholder="Why is this commitment important? What evidence supports it?"
                  value={newCommitment.rationale}
                  onChange={(e) => setNewCommitment({ ...newCommitment, rationale: e.target.value })}
                  data-testid="input-commitment-rationale"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCommitmentOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCommitment}
                disabled={!newCommitment.name || createCommitmentMutation.isPending}
                data-testid="button-save-commitment"
              >
                {createCommitmentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Outcome
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Outcome Dialog */}
        <Dialog open={!!editingCommitment} onOpenChange={() => setEditingCommitment(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Outcome</DialogTitle>
            </DialogHeader>
            {editingCommitment && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-commitment-name">Outcome Name *</Label>
                  <Input
                    id="edit-commitment-name"
                    value={editingCommitment.name}
                    onChange={(e) => setEditingCommitment({ ...editingCommitment, name: e.target.value })}
                    data-testid="input-edit-commitment-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-commitment-description">Description</Label>
                  <Textarea
                    id="edit-commitment-description"
                    value={editingCommitment.description || ""}
                    onChange={(e) => setEditingCommitment({ ...editingCommitment, description: e.target.value })}
                    data-testid="input-edit-commitment-description"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-commitment-baseline">Baseline Value</Label>
                    <Input
                      id="edit-commitment-baseline"
                      type="number"
                      value={editingCommitment.baselineValue || ""}
                      onChange={(e) => setEditingCommitment({ ...editingCommitment, baselineValue: e.target.value ? parseFloat(e.target.value) : null })}
                      data-testid="input-edit-commitment-baseline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-commitment-target">Target Value</Label>
                    <Input
                      id="edit-commitment-target"
                      type="number"
                      value={editingCommitment.targetValue || ""}
                      onChange={(e) => setEditingCommitment({ ...editingCommitment, targetValue: e.target.value ? parseFloat(e.target.value) : null })}
                      data-testid="input-edit-commitment-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-commitment-unit">Unit</Label>
                    <Input
                      id="edit-commitment-unit"
                      value={editingCommitment.kpiUnit || ""}
                      onChange={(e) => setEditingCommitment({ ...editingCommitment, kpiUnit: e.target.value })}
                      data-testid="input-edit-commitment-unit"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-commitment-target-date">Target Date</Label>
                    <Input
                      id="edit-commitment-target-date"
                      type="date"
                      value={editingCommitment.targetDate ? new Date(editingCommitment.targetDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditingCommitment({ ...editingCommitment, targetDate: e.target.value ? new Date(e.target.value) : null })}
                      data-testid="input-edit-commitment-target-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-commitment-value">Estimated Annual Value ($)</Label>
                    <Input
                      id="edit-commitment-value"
                      type="number"
                      value={editingCommitment.estimatedAnnualValue || ""}
                      onChange={(e) => setEditingCommitment({ ...editingCommitment, estimatedAnnualValue: e.target.value ? parseFloat(e.target.value) : null })}
                      data-testid="input-edit-commitment-value"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-commitment-rationale">Rationale</Label>
                  <Textarea
                    id="edit-commitment-rationale"
                    value={editingCommitment.rationale || ""}
                    onChange={(e) => setEditingCommitment({ ...editingCommitment, rationale: e.target.value })}
                    data-testid="input-edit-commitment-rationale"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={() => {
                  deleteCommitmentMutation.mutate(editingCommitment.id);
                  setEditingCommitment(null);
                }}
                data-testid="button-delete-commitment"
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingCommitment(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateCommitmentMutation.mutate({ 
                    id: editingCommitment.id, 
                    data: {
                      name: editingCommitment.name,
                      description: editingCommitment.description,
                      kpiUnit: editingCommitment.kpiUnit,
                      baselineValue: editingCommitment.baselineValue,
                      targetValue: editingCommitment.targetValue,
                      targetDate: editingCommitment.targetDate,
                      estimatedAnnualValue: editingCommitment.estimatedAnnualValue,
                      rationale: editingCommitment.rationale,
                    }
                  })}
                  disabled={!editingCommitment?.name || updateCommitmentMutation.isPending}
                  data-testid="button-update-commitment"
                >
                  {updateCommitmentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Calculate workflow stage completion for progress indicator
  const getWorkflowProgress = () => {
    const hasDiscoveryInsights = insights.length > 0;
    const hasAskedQuestions = discoveryQuestions.filter(q => q.isAsked).length > 0;
    const hasCommitments = commitments.length > 0;
    const hasConfirmedCommitments = commitments.filter((c: any) => c.status === "client_confirmed").length > 0;
    const hasHandoffs = handoffPackets.length > 0;
    
    return {
      discover: hasDiscoveryInsights || hasAskedQuestions ? 100 : (selectedDiscoveryTheme ? 50 : 0),
      buildValue: hasCommitments ? (hasConfirmedCommitments ? 100 : 50) : 0,
      align: hasConfirmedCommitments ? 100 : (hasCommitments ? 50 : 0),
      handoff: hasHandoffs ? 100 : (hasConfirmedCommitments ? 50 : 0),
    };
  };
  
  const workflowProgress = getWorkflowProgress();

  const renderSalesWorkspace = () => (
    <div className="flex gap-6">
      {/* Workflow Progress Sidebar */}
      <div className="hidden lg:block w-56 shrink-0" data-demo-step="workflow-progress">
        <div className="sticky top-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Sales Journey</p>
          {[
            { id: "discover", label: "Discover", icon: Sparkles, progress: workflowProgress.discover, description: "Research & Questions" },
            { id: "build-value", label: "Build Value", icon: Target, progress: workflowProgress.buildValue, description: "Outcomes & Commitments" },
            { id: "align", label: "Align", icon: Handshake, progress: workflowProgress.align, description: "Client Collaboration" },
            { id: "handoff", label: "Handoff", icon: ArrowUpRight, progress: workflowProgress.handoff, description: "Transition to Delivery" },
          ].map((stage, idx) => {
            const isActive = activeTab === stage.id;
            const isComplete = stage.progress === 100;
            const StageIcon = stage.icon;
            
            return (
              <button
                key={stage.id}
                onClick={() => setActiveTab(stage.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isActive 
                    ? "bg-primary/10 border-primary/30 shadow-sm" 
                    : "bg-background border-border/50 hover-elevate"
                }`}
                data-testid={`nav-${stage.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isComplete 
                      ? "bg-emerald-500 text-white" 
                      : isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : <StageIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>{stage.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
                  </div>
                </div>
                {stage.progress > 0 && stage.progress < 100 && (
                  <div className="mt-2 ml-11">
                    <Progress value={stage.progress} className="h-1" />
                  </div>
                )}
              </button>
            );
          })}
          
          {/* Quick Stats */}
          <div className="mt-6 p-3 rounded-lg bg-muted/30 border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick Stats</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Insights</span>
                <span className="font-medium">{insights.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Commitments</span>
                <span className="font-medium">{commitments.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Confirmed</span>
                <span className="font-medium text-emerald-600">{commitments.filter((c: any) => c.status === "client_confirmed").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Tab Navigation */}
          <TabsList className="grid grid-cols-4 w-full lg:hidden">
            <TabsTrigger value="discover" data-testid="tab-discover">
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="build-value" data-testid="tab-build-value">
              <Target className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Build</span>
            </TabsTrigger>
            <TabsTrigger value="align" data-testid="tab-align">
              <Handshake className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Align</span>
            </TabsTrigger>
            <TabsTrigger value="handoff" data-testid="tab-handoff">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Handoff</span>
            </TabsTrigger>
          </TabsList>

          {/* STAGE 2: BUILD VALUE - KPIs, Commitments, Stories */}
          <TabsContent value="build-value" className="space-y-6">
            {/* Sub-navigation for Build Value sections */}
            <div className="flex items-center gap-2 border-b pb-4">
              <Button
                variant={buildValueSection === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuildValueSection("overview")}
                data-testid="btn-build-overview"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={buildValueSection === "commitments" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuildValueSection("commitments")}
                data-testid="btn-build-commitments"
              >
                <Target className="w-4 h-4 mr-2" />
                Outcome Selection
                {commitments.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">{commitments.length}</Badge>
                )}
              </Button>
              <Button
                variant={buildValueSection === "stories" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuildValueSection("stories")}
                data-testid="btn-build-stories"
              >
                <Star className="w-4 h-4 mr-2" />
                Success Stories
              </Button>
            </div>

            {/* Overview Section */}
            {buildValueSection === "overview" && (
              <>
                <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20" data-demo-step="value-summary">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Target className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Value Overview</CardTitle>
                          <CardDescription>Track shared outcomes, value progress, and next steps</CardDescription>
                        </div>
                      </div>
                      <Button onClick={() => setBuildValueSection("commitments")} data-testid="btn-add-commitment-cta">
                        <Plus className="w-4 h-4 mr-2" />
                        Select Outcomes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 rounded-lg bg-background border">
                        <p className="text-sm text-muted-foreground">Total Value Potential</p>
                        <p className="text-2xl font-bold text-primary">${(totalValue / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background border">
                        <p className="text-sm text-muted-foreground">Commitments</p>
                        <p className="text-2xl font-bold">{commitments.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background border">
                        <p className="text-sm text-muted-foreground">Client Confirmed</p>
                        <p className="text-2xl font-bold text-emerald-600">{commitments.filter((c: any) => c.status === "client_confirmed").length}</p>
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

        {/* Shared Outcomes Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Shared Outcomes
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
                  <p className="text-muted-foreground mb-4">No outcomes defined yet</p>
                  <Link href={`/projects/${projectId}/discovery`}>
                    <Button data-testid="button-define-kpis">
                      <Plus className="w-4 h-4 mr-2" />
                      Define Outcomes in Discovery
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI-Recommended Outcome Selection */}
        {insights.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5 border-purple-500/20" data-demo-step="kpi-suggestions">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI-Recommended Outcome Selection</CardTitle>
                    <CardDescription>
                      {aiKpiSuggestions.length > 0 
                        ? `${aiKpiSuggestions.length} recommendations with industry & Korn Ferry benchmarks`
                        : `Generate strategic outcomes based on ${insights.length} discovery insights`
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-purple-500/10 text-purple-600">
                    {insights.length} Insight(s)
                  </Badge>
                  {aiKpiSuggestions.length === 0 && (
                    <Button 
                      size="sm"
                      onClick={generateAiKpiSuggestions}
                      disabled={aiKpiLoading}
                      data-testid="btn-generate-ai-kpis"
                    >
                      {aiKpiLoading ? (
                        <>
                          <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recommend Outcomes
                        </>
                      )}
                    </Button>
                  )}
                  {aiKpiSuggestions.length > 0 && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={generateAiKpiSuggestions}
                      disabled={aiKpiLoading}
                      data-testid="btn-regenerate-ai-kpis"
                    >
                      <RefreshCcw className={`w-3 h-3 mr-1 ${aiKpiLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {aiKpiError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-sm text-red-600">{aiKpiError}</p>
                </div>
              )}
              
              {aiKpiLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 rounded-lg bg-background border animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!aiKpiLoading && aiKpiSuggestions.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click "Recommend Outcomes" to get AI recommendations based on your discovery insights
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Outcomes include industry benchmarks, Korn Ferry benchmarks, and baseline recommendations
                  </p>
                </div>
              )}
              
              {!aiKpiLoading && aiKpiSuggestions.length > 0 && (
                <div className="space-y-4">
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border" data-demo-step="multi-select">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {selectedKpiSuggestions.size} of {aiKpiSuggestions.length} selected
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={selectAllKpis}
                          data-testid="btn-select-all-kpis"
                        >
                          Select All
                        </Button>
                        {selectedKpiSuggestions.size > 0 && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={deselectAllKpis}
                            data-testid="btn-deselect-all-kpis"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    {selectedKpiSuggestions.size > 0 && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          const selected = Array.from(selectedKpiSuggestions).map(idx => aiKpiSuggestions[idx]);
                          selected.forEach((suggestion, i) => {
                            setTimeout(() => handleAddSuggestionAsCommitment(suggestion), i * 100);
                          });
                          setSelectedKpiSuggestions(new Set());
                          toast({
                            title: "Outcomes Added",
                            description: `${selected.length} outcome(s) added to your selection`
                          });
                        }}
                        data-testid="btn-add-selected-kpis"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add {selectedKpiSuggestions.size} Selected
                      </Button>
                    )}
                  </div>

                  {/* Outcome Cards */}
                  <div className="space-y-3">
                    {aiKpiSuggestions.map((suggestion, idx) => {
                      const pillarColors: Record<string, string> = {
                        "Grow": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        "Optimise": "bg-blue-500/10 text-blue-600 border-blue-500/20",
                        "De-risk": "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        "Strengthen Capability": "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      };
                      const isSelected = selectedKpiSuggestions.has(idx);
                      return (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg bg-background border hover-elevate cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
                          onClick={() => toggleKpiSelection(idx)}
                          data-testid={`kpi-suggestion-card-${idx}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className="flex items-center pt-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <p className="font-medium">{suggestion.kpiName}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{suggestion.definition}</p>
                                </div>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddSuggestionAsCommitment(suggestion);
                                  }}
                                  data-testid={`btn-add-suggested-kpi-${idx}`}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Outcome
                                </Button>
                              </div>
                              
                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge className={`text-xs ${pillarColors[suggestion.valuePillar] || 'bg-muted'}`}>
                                  {suggestion.valuePillar}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.kpiType === "primary" ? "Primary" : "Supporting"}
                                </Badge>
                              </div>

                              {/* Baseline & Target with Reasoning */}
                              <div className="p-3 rounded-lg bg-muted/30 mb-3 space-y-2">
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <span className="text-xs text-muted-foreground block">Recommended Baseline</span>
                                    <span className="font-semibold text-lg">{suggestion.baselineEstimate}</span>
                                    <span className="text-xs text-muted-foreground ml-1">{suggestion.unit}</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <span className="text-xs text-muted-foreground block">Target</span>
                                    <span className="font-semibold text-lg text-emerald-600">{suggestion.targetEstimate}</span>
                                    <span className="text-xs text-muted-foreground ml-1">{suggestion.unit}</span>
                                  </div>
                                </div>
                                {suggestion.baselineReasoning && (
                                  <p className="text-xs text-muted-foreground border-t pt-2">
                                    <span className="font-medium">Why this baseline:</span> {suggestion.baselineReasoning}
                                  </p>
                                )}
                              </div>

                              {/* Benchmarks Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3" data-demo-step="benchmark-display">
                                {/* Industry Benchmark */}
                                {suggestion.industryBenchmark && (
                                  <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                    <div className="flex items-center gap-1 mb-1">
                                      <BarChart3 className="w-3 h-3 text-blue-600" />
                                      <span className="text-xs font-medium text-blue-600">Industry Benchmark</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-muted-foreground">Low:</span>
                                      <span>{suggestion.industryBenchmark.low}</span>
                                      <span className="text-muted-foreground">|</span>
                                      <span className="text-muted-foreground">Median:</span>
                                      <span className="font-medium">{suggestion.industryBenchmark.median}</span>
                                      <span className="text-muted-foreground">|</span>
                                      <span className="text-muted-foreground">High:</span>
                                      <span>{suggestion.industryBenchmark.high}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{suggestion.industryBenchmark.source}</p>
                                  </div>
                                )}
                                
                                {/* Korn Ferry Benchmark */}
                                {suggestion.kornFerryBenchmark && (
                                  <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Award className="w-3 h-3 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-600">Korn Ferry Benchmark</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-muted-foreground">Top Quartile:</span>
                                      <span className="font-medium text-emerald-600">{suggestion.kornFerryBenchmark.topQuartile}</span>
                                      <span className="text-muted-foreground">|</span>
                                      <span className="text-muted-foreground">Typical:</span>
                                      <span>{suggestion.kornFerryBenchmark.typical}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{suggestion.kornFerryBenchmark.context}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Rationale & Source */}
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Rationale:</span> {suggestion.strategicRationale}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Based on:</span> {suggestion.sourceInsightTitle}
                              </p>
                              
                              {/* Scores */}
                              <div className="flex gap-4 mt-2 pt-2 border-t">
                                <span className="text-xs">
                                  <span className="text-muted-foreground">Achievability:</span>{" "}
                                  <span className={suggestion.achievabilityScore >= 7 ? "text-emerald-600 font-medium" : suggestion.achievabilityScore >= 5 ? "text-amber-600" : "text-red-600"}>
                                    {suggestion.achievabilityScore}/10
                                  </span>
                                </span>
                                <span className="text-xs">
                                  <span className="text-muted-foreground">Value Impact:</span>{" "}
                                  <span className={suggestion.valueImpactScore >= 7 ? "text-emerald-600 font-medium" : suggestion.valueImpactScore >= 5 ? "text-amber-600" : "text-red-600"}>
                                    {suggestion.valueImpactScore}/10
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                    <p className="font-medium text-sm">Gather baseline data for outcomes</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "no-data").length} outcome(s) need baseline values defined to track progress
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
                    <p className="font-medium text-sm">Review at-risk outcomes</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "at-risk").length} outcome(s) are trending behind target - schedule a review
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
                      {kpis.filter(k => k.status === "off-track").length} outcome(s) are significantly behind - immediate intervention recommended
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
                    <p className="font-medium text-sm">All outcomes on track</p>
                    <p className="text-xs text-muted-foreground">
                      Consider documenting wins as success stories for future opportunities
                    </p>
                  </div>
                </div>
              )}
              {kpis.length === 0 && insights.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Complete discovery and define outcomes to see recommended actions
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
              </>
            )}

            {/* Commitments Section */}
            {buildValueSection === "commitments" && (
              <ValueAgreementTab 
                projectId={projectId} 
                project={project}
                insights={insights}
                kpis={kpis}
                jobThemes={jobThemes}
                prefillSuggestion={prefillSuggestion}
                onPrefillUsed={() => setPrefillSuggestion(null)}
              />
            )}

            {/* Success Stories Section */}
            {buildValueSection === "stories" && (
              <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle>Success Stories</CardTitle>
                      <CardDescription>Verified case studies and proof points for value conversations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">Leadership Development ROI</h4>
                        <Badge className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Global manufacturing company achieved 32% improvement in leadership bench strength through targeted development program.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Manufacturing</Badge>
                        <Badge variant="outline" className="text-xs">Leadership</Badge>
                        <Badge variant="secondary" className="text-xs">+32% Bench</Badge>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border hover-elevate">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">Talent Acquisition Transform</h4>
                        <Badge className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Technology company reduced time-to-hire by 40% while improving quality of hire scores.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Technology</Badge>
                        <Badge variant="outline" className="text-xs">Talent Acquisition</Badge>
                        <Badge variant="secondary" className="text-xs">-40% Time-to-hire</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Guided Discovery - Theme-Driven Workflow */}
          {/* STAGE 1: DISCOVER - Research & Questions */}
          <TabsContent value="discover" className="space-y-6">
        {/* Discovery Workflow Progress */}
        <Card className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5 border-blue-500/20" data-demo-step="discovery-research">
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
          
          // Local handleAiSuggest that passes successStories to the mutation
          const handleAiSuggest = (fieldToSuggest: string) => {
            const storiesForAi = successStories.map((s) => ({
              client: s.client,
              industry: s.industry,
              challenge: s.challenge,
              metrics: s.metrics
            }));
            handleAiSuggestWithStories(fieldToSuggest, storiesForAi);
          };
          
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
                </div>
              </CardHeader>
            </Card>

            {/* Enhanced Interactive Green Sheet */}
            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <Collapsible open={isGreenSheetExpanded} onOpenChange={setIsGreenSheetExpanded}>
                <CardHeader className="bg-emerald-500/10">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-emerald-700">
                            Interactive Green Sheet
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">Miller Heiman</Badge>
                          </CardTitle>
                          <CardDescription>Personalize your strategic call framework</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {meetingContact.name && (
                          <Badge variant="secondary" className="text-xs">
                            <UserCircle className="w-3 h-3 mr-1" />
                            {meetingContact.name}
                          </Badge>
                        )}
                        <ChevronDown className={`w-5 h-5 text-emerald-700 transition-transform ${isGreenSheetExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-6 space-y-6">
                    {/* Meeting Contact Context - Key Green Sheet Element */}
                    <div className="p-4 rounded-xl border-2 border-emerald-500/20 bg-white/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-emerald-800">
                          <UserCircle className="w-5 h-5" />
                          Who Are You Meeting? 
                          <span className="text-xs font-normal text-muted-foreground">(Influences your approach)</span>
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                          onClick={() => {
                            setEnrichmentResult(null);
                            setShowEnrichmentDialog(true);
                          }}
                          disabled={!meetingContact.name}
                          data-testid="button-enrich-contact"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Research Contact
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Contact Name</Label>
                          <Input 
                            placeholder="e.g., Sarah Chen"
                            value={meetingContact.name}
                            onChange={(e) => setMeetingContact(prev => ({ ...prev, name: e.target.value }))}
                            className="h-9"
                            data-testid="input-contact-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <Input 
                            placeholder="e.g., VP of People"
                            value={meetingContact.title}
                            onChange={(e) => setMeetingContact(prev => ({ ...prev, title: e.target.value }))}
                            className="h-9"
                            data-testid="input-contact-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Buying Role</Label>
                          <Select 
                            value={meetingContact.role || undefined} 
                            onValueChange={(v) => setMeetingContact(prev => ({ ...prev, role: v as BuyingRole }))}
                          >
                            <SelectTrigger className="h-9" data-testid="select-buying-role">
                              <SelectValue placeholder="Select role..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="economic_buyer" data-testid="select-item-economic-buyer">Economic Buyer (Budget)</SelectItem>
                              <SelectItem value="user_buyer" data-testid="select-item-user-buyer">User Buyer (Day-to-day)</SelectItem>
                              <SelectItem value="technical_buyer" data-testid="select-item-technical-buyer">Technical Buyer (Specs)</SelectItem>
                              <SelectItem value="coach" data-testid="select-item-coach">Coach (Helps navigate)</SelectItem>
                              <SelectItem value="champion" data-testid="select-item-champion">Champion (Advocates)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Influence Level</Label>
                          <Select 
                            value={meetingContact.influence || undefined} 
                            onValueChange={(v) => setMeetingContact(prev => ({ ...prev, influence: v as InfluenceLevel }))}
                          >
                            <SelectTrigger className="h-9" data-testid="select-influence">
                              <SelectValue placeholder="Influence..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high" data-testid="select-item-high">High - Key Decision Maker</SelectItem>
                              <SelectItem value="medium" data-testid="select-item-medium">Medium - Strong Influencer</SelectItem>
                              <SelectItem value="low" data-testid="select-item-low">Low - Stakeholder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Connection to Story Builder coaching */}
                      {meetingContact.role && meetingContact.name && (
                        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <span className="text-sm text-purple-700">
                                <span className="font-semibold">Coach ready for {meetingContact.name}</span>
                                {" · "}
                                Role-specific tips will appear in the Story Builder below
                              </span>
                            </div>
                            {!storyBuilderOpen && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-700 border-purple-500/30 hover:bg-purple-500/10"
                                onClick={() => setStoryBuilderOpen(true)}
                                data-testid="button-open-story-builder-from-greensheet"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                Open Story Builder
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Known Concerns / Priorities</Label>
                          <Textarea 
                            placeholder="What do you know about their current challenges, priorities, or concerns?"
                            value={meetingContact.knownConcerns}
                            onChange={(e) => setMeetingContact(prev => ({ ...prev, knownConcerns: e.target.value }))}
                            className="min-h-[60px] text-sm"
                            data-testid="input-known-concerns"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Personal Rapport Notes</Label>
                          <Textarea 
                            placeholder="Any personal details, shared connections, or rapport builders?"
                            value={meetingContact.personalRapport}
                            onChange={(e) => setMeetingContact(prev => ({ ...prev, personalRapport: e.target.value }))}
                            className="min-h-[60px] text-sm"
                            data-testid="input-rapport-notes"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Editable Call Framework */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <Target className="w-3 h-3 text-emerald-600" />
                            Call Objective
                          </Label>
                          <Textarea 
                            placeholder={callPlanner.objective}
                            value={greenSheetEdits.objective || callPlanner.objective}
                            onChange={(e) => setGreenSheetEdits(prev => ({ ...prev, objective: e.target.value }))}
                            className="min-h-[80px] text-sm bg-emerald-500/5 border-emerald-500/20 focus:border-emerald-500"
                            data-testid="input-call-objective"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Desired Outcome / Commitment
                          </Label>
                          <Textarea 
                            placeholder={callPlanner.desiredOutcome}
                            value={greenSheetEdits.desiredOutcome || callPlanner.desiredOutcome}
                            onChange={(e) => setGreenSheetEdits(prev => ({ ...prev, desiredOutcome: e.target.value }))}
                            className="min-h-[80px] text-sm bg-emerald-500/5 border-emerald-500/20 focus:border-emerald-500"
                            data-testid="input-desired-outcome"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            Your Opening Statement
                          </Label>
                          <Textarea 
                            placeholder={callPlanner.openingStatement}
                            value={greenSheetEdits.openingStatement || callPlanner.openingStatement}
                            onChange={(e) => setGreenSheetEdits(prev => ({ ...prev, openingStatement: e.target.value }))}
                            className="min-h-[80px] text-sm bg-emerald-500/5 border-emerald-500/20 focus:border-emerald-500"
                            data-testid="input-opening-statement"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            Best Action Commitment (What you'll ask for)
                          </Label>
                          <Textarea 
                            placeholder="What specific next step or commitment will you ask for at the end of this call?"
                            value={greenSheetEdits.bestActionCommitment}
                            onChange={(e) => setGreenSheetEdits(prev => ({ ...prev, bestActionCommitment: e.target.value }))}
                            className="min-h-[80px] text-sm bg-emerald-500/5 border-emerald-500/20 focus:border-emerald-500"
                            data-testid="input-best-action"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Rapport & Credibility - Compact */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-700">
                          <Heart className="w-4 h-4" />
                          Rapport Builders
                        </h4>
                        <div className="space-y-2">
                          {callPlanner.rapportBuilders.slice(0, 3).map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded bg-white/50">
                              <Check className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </div>
                          ))}
                          {meetingContact.personalRapport && (
                            <div className="flex items-start gap-2 text-xs p-2 rounded bg-blue-500/10 border border-blue-500/20">
                              <Star className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="font-medium">{meetingContact.personalRapport}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-purple-700">
                          <Award className="w-4 h-4" />
                          Credibility Statements
                        </h4>
                        <div className="space-y-2">
                          {callPlanner.credibilityStatements.slice(0, 3).map((statement, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs italic p-2 rounded bg-white/50">
                              <Check className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span>{statement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Unified Narrative Canvas - Combines Story + Questions + Call Flow */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Narrative Canvas
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Visual Storyboard</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        Your complete call narrative for {project?.companyName} - one visual flow
                        {lastSavedNarrative && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-700 border-green-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            Saved {lastSavedNarrative}
                          </Badge>
                        )}
                        {saveNarrativeCanvasMutation.isPending && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                            <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                            Saving...
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={async () => {
                        setIsGeneratingNarrative(true);
                        try {
                          const response = await apiRequest("POST", `/api/projects/${projectId}/ai/generate-narrative`, {
                            companyName: project?.companyName,
                            theme: selectedDiscoveryTheme,
                            contactName: meetingContact.name,
                            contactRole: meetingContact.role,
                            insights: insights?.slice(0, 3).map((i: any) => i.title) || []
                          });
                          const data = await response.json();
                          setNarrativeCanvas({
                            opener: data.opener || "",
                            keyMessage: data.keyMessage || "",
                            proofPoint: data.proofPoint || "",
                            keyQuestions: data.keyQuestions || [],
                            callToAction: data.callToAction || ""
                          });
                          toast({ title: "Narrative generated", description: "Your call storyboard is ready!" });
                        } catch (error) {
                          toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
                        }
                        setIsGeneratingNarrative(false);
                      }}
                      disabled={isGeneratingNarrative}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                      data-testid="button-generate-narrative"
                    >
                      {isGeneratingNarrative ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Generate All
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const content = `
CALL NARRATIVE - ${project?.companyName}
${new Date().toLocaleDateString()}
${"=".repeat(40)}

OPENING
${narrativeCanvas.opener || "(Not set)"}

KEY MESSAGE
${narrativeCanvas.keyMessage || "(Not set)"}

PROOF POINT
${narrativeCanvas.proofPoint || "(Not set)"}

KEY QUESTIONS
${narrativeCanvas.keyQuestions.length > 0 ? narrativeCanvas.keyQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") : "(Not set)"}

CALL TO ACTION
${narrativeCanvas.callToAction || "(Not set)"}
                        `.trim();
                        navigator.clipboard.writeText(content);
                        toast({ title: "Copied to clipboard", description: "Paste into your notes or export" });
                      }}
                      data-testid="button-export-narrative"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Visual Storyboard - 4 Connected Lanes */}
                <div className="relative">
                  {/* Connection line */}
                  <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 via-purple-500 to-amber-500 hidden md:block" />
                  
                  <div className="space-y-4">
                    {/* OPEN Lane */}
                    <div className="relative pl-0 md:pl-14">
                      <div className="absolute left-0 top-3 w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold hidden md:flex z-10">
                        1
                      </div>
                      <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex items-center gap-2 mb-3">
                          <Play className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-emerald-700">OPEN</h4>
                          <span className="text-xs text-muted-foreground">How to start the conversation</span>
                        </div>
                        <Textarea 
                          placeholder="E.g., 'I noticed your recent acquisition and was curious about how you're approaching leadership integration...'"
                          value={narrativeCanvas.opener}
                          onChange={(e) => setNarrativeCanvas(prev => ({ ...prev, opener: e.target.value }))}
                          className="min-h-[60px] text-sm bg-white/50"
                          data-testid="input-narrative-opener"
                        />
                      </div>
                    </div>
                    
                    {/* STORY Lane */}
                    <div className="relative pl-0 md:pl-14">
                      <div className="absolute left-0 top-3 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold hidden md:flex z-10">
                        2
                      </div>
                      <div className="p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-blue-700">STORY</h4>
                          <span className="text-xs text-muted-foreground">Your key message + proof</span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Key Message</Label>
                            <Textarea 
                              placeholder="The single idea they MUST remember..."
                              value={narrativeCanvas.keyMessage}
                              onChange={(e) => setNarrativeCanvas(prev => ({ ...prev, keyMessage: e.target.value }))}
                              className="min-h-[60px] text-sm bg-white/50"
                              data-testid="input-narrative-message"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Proof Point</Label>
                            <Textarea 
                              placeholder="Evidence, data, or success story..."
                              value={narrativeCanvas.proofPoint}
                              onChange={(e) => setNarrativeCanvas(prev => ({ ...prev, proofPoint: e.target.value }))}
                              className="min-h-[60px] text-sm bg-white/50"
                              data-testid="input-narrative-proof"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ASK Lane - Enhanced with Methodology */}
                    <div className="relative pl-0 md:pl-14">
                      <div className="absolute left-0 top-3 w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold hidden md:flex z-10">
                        3
                      </div>
                      <div className="p-4 rounded-xl border-2 border-purple-500/30 bg-purple-500/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-purple-600" />
                            <h4 className="font-bold text-purple-700">ASK</h4>
                            <span className="text-xs text-muted-foreground">Outcome-focused questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={selectedQuestionMethodology} 
                              onValueChange={(v: "all" | "spin" | "miller_heiman" | "pss") => setSelectedQuestionMethodology(v)}
                            >
                              <SelectTrigger className="h-8 w-[140px] text-xs" data-testid="select-methodology">
                                <SelectValue placeholder="Methodology" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="spin">SPIN Selling</SelectItem>
                                <SelectItem value="miller_heiman">Miller Heiman</SelectItem>
                                <SelectItem value="pss">PSS</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                setIsGeneratingQuestions(true);
                                try {
                                  const response = await apiRequest("POST", `/api/projects/${projectId}/ai/generate-methodology-questions`, {
                                    companyName: project?.companyName,
                                    theme: selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : "Leadership Development",
                                    contactRole: meetingContact?.role,
                                    methodology: selectedQuestionMethodology,
                                    insights: insights?.slice(0, 3).map((i: any) => i.label) || []
                                  });
                                  const data = await response.json();
                                  if (data.questions && data.questions.length > 0) {
                                    setMethodologyQuestions(data.questions);
                                    // Also populate the basic keyQuestions with the generated ones
                                    setNarrativeCanvas(prev => ({ 
                                      ...prev, 
                                      keyQuestions: data.questions.slice(0, 3).map((q: any) => q.question) 
                                    }));
                                    toast({ title: "Questions generated", description: `${data.questions.length} outcome-focused questions ready` });
                                  }
                                } catch (error) {
                                  toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
                                }
                                setIsGeneratingQuestions(false);
                              }}
                              disabled={isGeneratingQuestions}
                              className="text-purple-700 border-purple-300"
                              data-testid="button-generate-questions"
                            >
                              {isGeneratingQuestions ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Generate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Methodology Questions Display */}
                        {methodologyQuestions.length > 0 ? (
                          <div className="space-y-3">
                            {methodologyQuestions.map((q, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-white/60 border border-purple-200/50 space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{q.question}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          q.methodology === "SPIN" ? "bg-blue-50 text-blue-700 border-blue-300" :
                                          q.methodology === "Miller Heiman" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                                          "bg-amber-50 text-amber-700 border-amber-300"
                                        }`}
                                      >
                                        {q.methodology}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{q.stage}</span>
                                      {q.outcome && (
                                        <span className="text-xs text-purple-600 flex items-center gap-1">
                                          <Target className="w-3 h-3" />
                                          {q.outcome}
                                        </span>
                                      )}
                                    </div>
                                    {q.followUp && (
                                      <p className="text-xs text-muted-foreground mt-1 italic">
                                        Follow-up: {q.followUp}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      navigator.clipboard.writeText(q.question);
                                      toast({ title: "Copied", description: "Question copied to clipboard" });
                                    }}
                                    data-testid={`button-copy-question-${idx}`}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {/* Generate More Button */}
                            <div className="flex items-center justify-center gap-3 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  setIsGeneratingQuestions(true);
                                  try {
                                    const response = await apiRequest("POST", `/api/projects/${projectId}/ai/generate-methodology-questions`, {
                                      companyName: project?.companyName,
                                      theme: selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : "Leadership Development",
                                      contactRole: meetingContact?.role,
                                      methodology: selectedQuestionMethodology,
                                      insights: insights?.slice(0, 3).map((i: any) => i.label) || []
                                    });
                                    const data = await response.json();
                                    if (data.questions && data.questions.length > 0) {
                                      // Append new questions to existing ones
                                      setMethodologyQuestions(prev => [...prev, ...data.questions]);
                                      toast({ title: "More questions added", description: `${data.questions.length} new questions generated` });
                                    }
                                  } catch (error) {
                                    toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
                                  }
                                  setIsGeneratingQuestions(false);
                                }}
                                disabled={isGeneratingQuestions}
                                className="text-purple-700 border-purple-300"
                                data-testid="button-generate-more-questions"
                              >
                                {isGeneratingQuestions ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                  <Plus className="w-4 h-4 mr-1" />
                                )}
                                Generate More
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setMethodologyQuestions([]);
                                  setNarrativeCanvas(prev => ({ ...prev, keyQuestions: [] }));
                                }}
                                className="text-muted-foreground"
                                data-testid="button-clear-questions"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Clear All
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              {methodologyQuestions.length} questions generated
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {[0, 1, 2].map((idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <Input 
                                  placeholder={idx === 0 ? "What's your biggest priority right now?" : idx === 1 ? "How is that impacting your team?" : "What would success look like?"}
                                  value={narrativeCanvas.keyQuestions[idx] || ""}
                                  onChange={(e) => {
                                    const newQuestions = [...narrativeCanvas.keyQuestions];
                                    newQuestions[idx] = e.target.value;
                                    setNarrativeCanvas(prev => ({ ...prev, keyQuestions: newQuestions }));
                                  }}
                                  className="text-sm bg-white/50"
                                  data-testid={`input-narrative-question-${idx}`}
                                />
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground text-center mt-2">
                              Use "Generate" to create methodology-based, outcome-focused questions
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* CLOSE Lane */}
                    <div className="relative pl-0 md:pl-14">
                      <div className="absolute left-0 top-3 w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold hidden md:flex z-10">
                        4
                      </div>
                      <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-amber-700">CLOSE</h4>
                          <span className="text-xs text-muted-foreground">Your call to action</span>
                        </div>
                        <Textarea 
                          placeholder="E.g., 'Based on what we've discussed, I'd love to schedule a deeper dive with our leadership practice...'"
                          value={narrativeCanvas.callToAction}
                          onChange={(e) => setNarrativeCanvas(prev => ({ ...prev, callToAction: e.target.value }))}
                          className="min-h-[60px] text-sm bg-white/50"
                          data-testid="input-narrative-cta"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Visual Preview Card */}
                {(narrativeCanvas.opener || narrativeCanvas.keyMessage || narrativeCanvas.keyQuestions.some(q => q)) && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        Preview: Your Call Flow
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {[narrativeCanvas.opener, narrativeCanvas.keyMessage, narrativeCanvas.proofPoint, ...narrativeCanvas.keyQuestions, narrativeCanvas.callToAction].filter(Boolean).length} / 7 complete
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {narrativeCanvas.opener && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-700">
                          <Play className="w-3 h-3" /> Opening ready
                        </div>
                      )}
                      {narrativeCanvas.keyMessage && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-700">
                          <MessageCircle className="w-3 h-3" /> Message ready
                        </div>
                      )}
                      {narrativeCanvas.keyQuestions.filter(q => q).length > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-700">
                          <HelpCircle className="w-3 h-3" /> {narrativeCanvas.keyQuestions.filter(q => q).length} questions
                        </div>
                      )}
                      {narrativeCanvas.callToAction && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-700">
                          <Target className="w-3 h-3" /> CTA ready
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
          const hasExportableContent = myCallFlow.length > 0 || selectedQuestions.size > 0;
          
          const generateExportContent = () => {
            const themeName = selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : "Discovery";
            const lines: string[] = [];
            lines.push(`# ${themeName} Discovery - Call Preparation`);
            lines.push(`Generated: ${new Date().toLocaleDateString()}`);
            lines.push("");
            
            const callFlow = myCallFlow || [];
            const questions = discoveryQuestions || [];
            const selected = selectedQuestions || new Set<number>();
            
            const hasCallFlow = callFlow.length > 0;
            const selectedQs = questions.filter(q => selected.has(q.id));
            const hasSelectedQuestions = selectedQs.length > 0;
            
            if (!hasCallFlow && !hasSelectedQuestions) {
              return null;
            }
            
            if (hasCallFlow) {
              lines.push("## My Call Flow");
              lines.push("");
              const phases = ["opening", "discovery", "support", "closing"];
              phases.forEach(phase => {
                const phaseQuestions = callFlow.filter(q => q.phase === phase);
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
                if (q.relatedKPI) lines.push(`   Outcome: ${q.relatedKPI}`);
                lines.push("");
              });
            }
            
            return lines.join("\n");
          };
          
          const handleCopyToClipboard = async () => {
            if (!hasExportableContent) {
              toast({ title: "Nothing to export", description: "Select questions or build a call flow first", variant: "destructive" });
              return;
            }
            try {
              const content = generateExportContent();
              if (!content) {
                toast({ title: "Nothing to export", description: "Select questions or build a call flow first", variant: "destructive" });
                return;
              }
              await navigator.clipboard.writeText(content);
              toast({ title: "Copied!", description: "Call preparation exported to clipboard" });
            } catch {
              toast({ title: "Copy failed", description: "Please try the download option instead", variant: "destructive" });
            }
          };
          
          const handleDownload = () => {
            if (!hasExportableContent) {
              toast({ title: "Nothing to export", description: "Select questions or build a call flow first", variant: "destructive" });
              return;
            }
            try {
              const content = generateExportContent();
              if (!content) {
                toast({ title: "Nothing to export", description: "Select questions or build a call flow first", variant: "destructive" });
                return;
              }
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
                            onClick={() => setSelectedQuestions(new Set((discoveryQuestions || []).map(q => q.id)))}
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
                            {selectedQuestions.size} of {(discoveryQuestions || []).length} selected
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
                        {(discoveryQuestions || []).map((q) => {
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
                                      <Badge variant="secondary" className="text-xs">Outcome: {q.relatedKPI}</Badge>
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
                    {(discoveryQuestions || []).filter(q => selectedQuestions.has(q.id)).slice(0, 5).map((q) => (
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
          const questions = discoveryQuestions || [];
          const selectedQs = questions.filter(q => selectedQuestions.has(q.id));
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
                      <p className="text-xs text-muted-foreground">Work with stakeholders to establish specific outcomes and targets for measuring {themeName} impact.</p>
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

          {/* STAGE 3: ALIGN - Value Agreement & Client Collaboration */}
          <TabsContent value="align" className="space-y-6">
            <ValueAgreementTab 
              projectId={projectId} 
              project={project}
              insights={insights}
              kpis={kpis}
              jobThemes={jobThemes}
              prefillSuggestion={null}
              onPrefillUsed={() => {}}
            />
          </TabsContent>

          {/* STAGE 4: HANDOFF - Transition to Delivery */}
          <TabsContent value="handoff" className="space-y-6">
            <HandoffTab projectId={projectId} project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Handoff Tab Component (Sales sends commitments to CSM)
  const HandoffTab = ({ 
    projectId, 
    project 
  }: { 
    projectId: number; 
    project: Project; 
  }) => {
    const [executiveSummary, setExecutiveSummary] = useState("");
    const [isCreateHandoffOpen, setIsCreateHandoffOpen] = useState(false);
    const [selectedCommitmentIds, setSelectedCommitmentIds] = useState<number[]>([]);

    // Fetch commitments
    const { data: commitments = [] } = useQuery({
      queryKey: ["/api/projects", projectId, "commitments"],
    });

    // Fetch existing handoff packets
    const { data: handoffPackets = [] } = useQuery({
      queryKey: ["/api/projects", projectId, "handoffs"],
    });

    // Create handoff packet mutation
    const createHandoffMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", `/api/projects/${projectId}/handoffs`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoffs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        setIsCreateHandoffOpen(false);
        setExecutiveSummary("");
        setSelectedCommitmentIds([]);
        toast({ title: "Handoff created", description: "The CSM team has been notified." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to create handoff package." });
      }
    });

    const confirmedCommitments = (commitments as any[]).filter(c => c.status === "client_confirmed");
    const handedOffCommitments = (commitments as any[]).filter(c => c.status === "handed_off");
    const confirmedValue = confirmedCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);

    const toggleCommitmentSelection = (id: number) => {
      if (selectedCommitmentIds.includes(id)) {
        setSelectedCommitmentIds(prev => prev.filter(cid => cid !== id));
      } else {
        setSelectedCommitmentIds(prev => [...prev, id]);
      }
    };

    const selectAllConfirmed = () => {
      setSelectedCommitmentIds(confirmedCommitments.map(c => c.id));
    };

    const handleCreateHandoff = () => {
      createHandoffMutation.mutate({
        commitmentIds: selectedCommitmentIds,
        executiveSummary: executiveSummary || null,
        salesOwnerName: "Sales Team",
      });
    };

    const getPacketStatusBadge = (state: string) => {
      switch (state) {
        case "pending":
          return <Badge className="bg-amber-500/10 text-amber-600">Pending CSM Review</Badge>;
        case "accepted":
          return <Badge className="bg-emerald-500/10 text-emerald-600">Accepted</Badge>;
        case "needs_clarification":
          return <Badge className="bg-blue-500/10 text-blue-600">Needs Clarification</Badge>;
        default:
          return <Badge variant="outline">{state}</Badge>;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Handoff to Delivery</CardTitle>
                  <CardDescription>
                    Bundle confirmed outcomes and send to CSM for delivery tracking
                  </CardDescription>
                </div>
              </div>
              {confirmedCommitments.length > 0 && (
                <Badge className="bg-emerald-500/10 text-emerald-600">
                  {confirmedCommitments.length} Ready
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Confirmed Outcomes</p>
                <p className="text-2xl font-bold text-emerald-600">{confirmedCommitments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Handed Off</p>
                <p className="text-2xl font-bold text-purple-600">{handedOffCommitments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Handoff Packets Sent</p>
                <p className="text-2xl font-bold">{(handoffPackets as any[]).length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Value Ready for Handoff</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${(confirmedValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready for Handoff */}
        {confirmedCommitments.length > 0 && (
          <Card data-demo-step="handoff-section">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Client-Confirmed Outcomes
                </CardTitle>
                <CardDescription>
                  Select outcomes to include in handoff package
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllConfirmed}>
                  Select All
                </Button>
                <Button 
                  onClick={() => setIsCreateHandoffOpen(true)}
                  disabled={selectedCommitmentIds.length === 0}
                  data-testid="button-create-handoff"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Create Handoff ({selectedCommitmentIds.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {confirmedCommitments.map((c: any) => (
                  <div 
                    key={c.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCommitmentIds.includes(c.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-emerald-500/20 bg-emerald-500/5 hover-elevate"
                    }`}
                    onClick={() => toggleCommitmentSelection(c.id)}
                    data-testid={`commitment-select-${c.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
                          selectedCommitmentIds.includes(c.id) 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground/30"
                        }`}>
                          {selectedCommitmentIds.includes(c.id) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{c.name}</h4>
                          {c.description && (
                            <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            {c.baselineValue !== null && c.targetValue !== null && (
                              <span className="text-muted-foreground">
                                {c.baselineValue} → {c.targetValue} {c.kpiUnit || ""}
                              </span>
                            )}
                            {c.targetDate && (
                              <span className="text-muted-foreground">
                                Target: {new Date(c.targetDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-600">Confirmed</Badge>
                        {c.estimatedAnnualValue && (
                          <p className="text-lg font-bold text-emerald-600 mt-2">
                            ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Confirmed Outcomes */}
        {confirmedCommitments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Outcomes Ready</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Confirm outcomes with clients in the Outcome Selection tab before handing off.
              </p>
              <Button variant="outline" onClick={() => setActiveTab("value-agreement")}>
                Go to Outcome Selection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Existing Handoff Packets */}
        {(handoffPackets as any[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Handoff History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(handoffPackets as any[]).map((packet: any) => (
                  <div key={packet.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">Package #{packet.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          Sent: {new Date(packet.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getPacketStatusBadge(packet.acceptanceState)}
                    </div>
                    {packet.executiveSummary && (
                      <p className="text-sm text-muted-foreground mb-2">{packet.executiveSummary}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span>{packet.commitmentIds?.length || 0} Outcomes</span>
                      {packet.totalCommittedValue && (
                        <span className="text-emerald-600 font-medium">
                          ${(packet.totalCommittedValue / 1000000).toFixed(2)}M
                        </span>
                      )}
                      {packet.acceptedAt && (
                        <span className="text-muted-foreground">
                          Accepted: {new Date(packet.acceptedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {/* Show clarification requests if any */}
                    {packet.clarificationRequests && (packet.clarificationRequests as any[]).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Clarification Requests:</p>
                        {(packet.clarificationRequests as any[]).map((req: any, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-muted/50 text-sm mb-2">
                            <p className="font-medium">Q: {req.question}</p>
                            {req.answer ? (
                              <p className="text-muted-foreground mt-1">A: {req.answer}</p>
                            ) : (
                              <p className="text-blue-600 mt-1">Awaiting your response...</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Handoff Dialog */}
        <Dialog open={isCreateHandoffOpen} onOpenChange={setIsCreateHandoffOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Handoff Package</DialogTitle>
              <DialogDescription>
                Bundle {selectedCommitmentIds.length} outcome(s) and send to the delivery team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Selected Outcomes</span>
                  <Badge variant="secondary">{selectedCommitmentIds.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Value: ${(confirmedCommitments
                    .filter(c => selectedCommitmentIds.includes(c.id))
                    .reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0) / 1000000
                  ).toFixed(2)}M
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="executive-summary">Executive Summary (optional)</Label>
                <Textarea
                  id="executive-summary"
                  placeholder="Provide context for the delivery team..."
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  data-testid="input-executive-summary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateHandoffOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateHandoff}
                disabled={createHandoffMutation.isPending}
                data-testid="button-confirm-handoff"
              >
                {createHandoffMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                )}
                Send to Delivery
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Incoming Handoffs Tab Component (CSM receives KPIs from Sales)
  const IncomingHandoffsTab = ({ 
    projectId, 
    project 
  }: { 
    projectId: number; 
    project: Project; 
  }) => {
    const [clarificationQuestion, setClarificationQuestion] = useState("");
    const [selectedHandoff, setSelectedHandoff] = useState<any>(null);
    const [acceptanceNotes, setAcceptanceNotes] = useState("");
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [isClarifyDialogOpen, setIsClarifyDialogOpen] = useState(false);

    // Fetch handoff packets
    const { data: handoffPackets = [], isLoading: packetsLoading } = useQuery({
      queryKey: ["/api/projects", projectId, "handoffs"],
    });

    // Fetch commitments for display
    const { data: commitments = [] } = useQuery({
      queryKey: ["/api/projects", projectId, "commitments"],
    });

    // Accept handoff mutation
    const acceptHandoffMutation = useMutation({
      mutationFn: async ({ id, data }: { id: number; data: any }) => {
        const response = await apiRequest("PATCH", `/api/projects/${projectId}/handoffs/${id}/accept`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoffs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        setIsAcceptDialogOpen(false);
        setSelectedHandoff(null);
        setAcceptanceNotes("");
        toast({ title: "Handoff accepted", description: "Outcomes are now ready for delivery tracking." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to accept handoff." });
      }
    });

    // Request clarification mutation
    const requestClarificationMutation = useMutation({
      mutationFn: async ({ id, question }: { id: number; question: string }) => {
        const response = await apiRequest("PATCH", `/api/projects/${projectId}/handoffs/${id}/clarify`, { question });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoffs"] });
        setIsClarifyDialogOpen(false);
        setSelectedHandoff(null);
        setClarificationQuestion("");
        toast({ title: "Clarification requested", description: "Sales team has been notified." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to request clarification." });
      }
    });

    const getPacketStatusBadge = (state: string) => {
      switch (state) {
        case "pending":
          return <Badge className="bg-amber-500/10 text-amber-600">Pending Review</Badge>;
        case "accepted":
          return <Badge className="bg-emerald-500/10 text-emerald-600">Accepted</Badge>;
        case "needs_clarification":
          return <Badge className="bg-blue-500/10 text-blue-600">Awaiting Clarification</Badge>;
        case "rejected":
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="outline">{state}</Badge>;
      }
    };

    // Get commitment details for a packet
    const getPacketCommitments = (packet: any) => {
      if (!packet.commitmentIds) return [];
      return (commitments as any[]).filter(c => packet.commitmentIds.includes(c.id));
    };

    const pendingPackets = (handoffPackets as any[]).filter(p => p.acceptanceState === "pending");
    const clarificationPackets = (handoffPackets as any[]).filter(p => p.acceptanceState === "needs_clarification");
    const acceptedPackets = (handoffPackets as any[]).filter(p => p.acceptanceState === "accepted");
    
    const activeCommitments = (commitments as any[]).filter(c => 
      c.status === "in_delivery" || c.status === "handed_off"
    );
    const totalActiveValue = activeCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Handshake className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <CardTitle>Incoming Handoffs</CardTitle>
                <CardDescription>
                  Review and accept outcome packages from Sales
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600">{pendingPackets.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Awaiting Clarification</p>
                <p className="text-2xl font-bold text-blue-600">{clarificationPackets.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Active Outcomes</p>
                <p className="text-2xl font-bold text-emerald-600">{activeCommitments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Value in Delivery</p>
                <p className="text-2xl font-bold text-cyan-600">
                  ${(totalActiveValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Handoffs */}
        {pendingPackets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pending Review
              </CardTitle>
              <CardDescription>
                Review these handoff packages and accept or request clarification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPackets.map((packet: any) => {
                const packetCommitments = getPacketCommitments(packet);
                const packetValue = packetCommitments.reduce((sum: number, c: any) => sum + (c.estimatedAnnualValue || 0), 0);
                
                return (
                  <div 
                    key={packet.id} 
                    className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5"
                    data-testid={`handoff-pending-${packet.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Handoff Package #{packet.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          From: {packet.salesOwnerName || "Sales Team"} • {new Date(packet.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getPacketStatusBadge(packet.acceptanceState)}
                    </div>
                    
                    {packet.executiveSummary && (
                      <p className="text-sm mb-3">{packet.executiveSummary}</p>
                    )}

                    <div className="grid gap-2 mb-4">
                      <p className="text-sm font-medium">Included Outcomes ({packetCommitments.length}):</p>
                      {packetCommitments.map((c: any) => (
                        <div key={c.id} className="p-2 rounded bg-background/50 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm">{c.name}</span>
                            {c.baselineValue !== null && c.targetValue !== null && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({c.baselineValue} → {c.targetValue} {c.kpiUnit || ""})
                              </span>
                            )}
                          </div>
                          {c.estimatedAnnualValue && (
                            <span className="text-sm font-medium text-emerald-600">
                              ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-lg font-bold text-emerald-600">
                          ${(packetValue / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedHandoff(packet);
                            setIsClarifyDialogOpen(true);
                          }}
                          data-testid={`button-request-clarification-${packet.id}`}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Request Clarification
                        </Button>
                        <Button 
                          onClick={() => {
                            setSelectedHandoff(packet);
                            setIsAcceptDialogOpen(true);
                          }}
                          data-testid={`button-accept-handoff-${packet.id}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept Handoff
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Active Outcomes in Delivery */}
        {activeCommitments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Active Outcomes in Delivery
              </CardTitle>
              <CardDescription>
                Outcomes you've accepted and are now tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeCommitments.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5"
                    data-testid={`commitment-active-${c.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{c.name}</h4>
                        {c.description && (
                          <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                        )}
                      </div>
                      <Badge className="bg-cyan-500/10 text-cyan-600">In Delivery</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Baseline</p>
                        <p className="font-medium">{c.baselineValue ?? "—"} {c.kpiUnit || ""}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="font-medium">{c.targetValue ?? "—"} {c.kpiUnit || ""}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Target Date</p>
                        <p className="font-medium">
                          {c.targetDate ? new Date(c.targetDate).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Value</p>
                        <p className="font-medium text-emerald-600">
                          ${c.estimatedAnnualValue ? (c.estimatedAnnualValue / 1000).toFixed(0) + "K" : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {pendingPackets.length === 0 && activeCommitments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Handoffs Yet</h3>
              <p className="text-sm text-muted-foreground">
                When Sales sends outcomes, they'll appear here for your review.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Accept Dialog */}
        <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Handoff Package</DialogTitle>
              <DialogDescription>
                By accepting, you're committing to track and deliver on these outcomes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="acceptance-notes">Acceptance Notes (optional)</Label>
                <Textarea
                  id="acceptance-notes"
                  placeholder="Add any notes about your acceptance..."
                  value={acceptanceNotes}
                  onChange={(e) => setAcceptanceNotes(e.target.value)}
                  data-testid="input-acceptance-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedHandoff) {
                    acceptHandoffMutation.mutate({
                      id: selectedHandoff.id,
                      data: {
                        csmOwnerName: "CSM Team",
                        acceptanceNotes,
                      }
                    });
                  }
                }}
                disabled={acceptHandoffMutation.isPending}
                data-testid="button-confirm-accept"
              >
                {acceptHandoffMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Accept Handoff
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clarification Dialog */}
        <Dialog open={isClarifyDialogOpen} onOpenChange={setIsClarifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Clarification</DialogTitle>
              <DialogDescription>
                Ask the Sales team for more information before accepting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clarification-question">Your Question *</Label>
                <Textarea
                  id="clarification-question"
                  placeholder="What do you need clarification on?"
                  value={clarificationQuestion}
                  onChange={(e) => setClarificationQuestion(e.target.value)}
                  data-testid="input-clarification-question"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClarifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedHandoff && clarificationQuestion) {
                    requestClarificationMutation.mutate({
                      id: selectedHandoff.id,
                      question: clarificationQuestion
                    });
                  }
                }}
                disabled={!clarificationQuestion || requestClarificationMutation.isPending}
                data-testid="button-submit-clarification"
              >
                {requestClarificationMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4 mr-2" />
                )}
                Send Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderDeliveryWorkspace = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-6 w-full max-w-4xl">
        <TabsTrigger value="health" data-testid="tab-health">
          <Activity className="w-4 h-4 mr-2" />
          Health Dashboard
        </TabsTrigger>
        <TabsTrigger value="incoming-handoffs" data-testid="tab-incoming-handoffs">
          <Handshake className="w-4 h-4 mr-2" />
          Incoming Handoffs
        </TabsTrigger>
        <TabsTrigger value="kpis" data-testid="tab-kpis">
          <BarChart3 className="w-4 h-4 mr-2" />
          Outcome Tracking
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
        <Card className="bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-emerald-500/20" data-demo-step="delivery-dashboard">
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
                  <span className="font-medium text-sm">Total Outcomes</span>
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
                Outcome Health Summary
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
                  <p className="text-sm text-muted-foreground text-center py-4">No outcomes tracked yet</p>
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

      {/* Incoming Handoffs - CSM receives outcomes from Sales */}
      <TabsContent value="incoming-handoffs" className="space-y-6" data-demo-step="incoming-handoffs">
        <IncomingHandoffsTab 
          projectId={projectId} 
          project={project}
        />
      </TabsContent>

      <TabsContent value="kpis" className="space-y-6" data-demo-step="kpi-tracking">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Outcome Tracking</CardTitle>
              <CardDescription>Monitor and log outcome measurements</CardDescription>
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
                  <p className="text-muted-foreground">No outcomes to track</p>
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
                  <span className="font-medium text-sm">Outcomes Tracked</span>
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
                  Each outcome has a designated client owner accountable for measurement
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
                  3-5 shared outcomes defined with benefit owners
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Monthly outcome review cadence established
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
              <DemoModeButton />
              
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
        <div className="mb-8" data-demo-step="account-header">
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
            <DialogTitle>Log Outcome Measurement</DialogTitle>
            <DialogDescription>Record an actual value for an outcome</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Outcome</Label>
              <Select
                value={selectedKPI?.id.toString() || ""}
                onValueChange={(v) => setSelectedKPI(kpis.find(k => k.id.toString() === v) || null)}
              >
                <SelectTrigger data-testid="select-kpi">
                  <SelectValue placeholder="Choose an outcome" />
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

      {/* Contact Enrichment Dialog */}
      <Dialog open={showEnrichmentDialog} onOpenChange={setShowEnrichmentDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-blue-600" />
              Research Contact: {meetingContact.name || "Contact"}
            </DialogTitle>
            <DialogDescription>
              Get AI-powered insights to prepare for your meeting
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={enrichmentMethod} onValueChange={(v) => setEnrichmentMethod(v as "ai" | "linkedin" | "data")} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Research
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                LinkedIn
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Data Enrich
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">AI-Powered Research</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on <span className="font-semibold">{meetingContact.name}</span>'s role at <span className="font-semibold">{project?.companyName}</span>, 
                      AI will generate insights about their likely priorities, concerns, and communication style.
                    </p>
                  </div>
                </div>
              </div>

              {!enrichmentResult && (
                <div className="flex justify-center py-4">
                  <Button
                    onClick={() => enrichContactMutation.mutate({
                      contactName: meetingContact.name,
                      title: meetingContact.title || undefined,
                      linkedInUrl: linkedInUrl || undefined
                    })}
                    disabled={enrichContactMutation.isPending || !meetingContact.name}
                    className="gap-2"
                    data-testid="button-run-ai-research"
                  >
                    {enrichContactMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Research {meetingContact.name}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {enrichmentResult && (
                <div className="space-y-4">
                  {/* Background */}
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Users className="w-3 h-3" />
                      Professional Background
                    </Label>
                    <p className="text-sm">{enrichmentResult.background}</p>
                  </div>

                  {/* Suggested Role & Influence */}
                  <div className="grid grid-cols-2 gap-3">
                    {enrichmentResult.suggestedRole && (
                      <div className="p-3 rounded-lg border bg-purple-500/10 border-purple-500/20">
                        <Label className="text-xs text-purple-700">Likely Buying Role</Label>
                        <p className="text-sm font-medium mt-1 capitalize">
                          {enrichmentResult.suggestedRole.replace("_", " ")}
                        </p>
                      </div>
                    )}
                    {enrichmentResult.suggestedInfluence && (
                      <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20">
                        <Label className="text-xs text-amber-700">Influence Level</Label>
                        <p className="text-sm font-medium mt-1 capitalize">{enrichmentResult.suggestedInfluence}</p>
                      </div>
                    )}
                  </div>

                  {/* Priorities & Concerns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <Target className="w-3 h-3 text-green-600" />
                        Likely Priorities
                      </Label>
                      <ul className="space-y-1">
                        {enrichmentResult.likelyPriorities.map((p, i) => (
                          <li key={i} className="text-sm flex items-start gap-1.5">
                            <span className="text-green-600 mt-0.5">•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <AlertCircle className="w-3 h-3 text-orange-600" />
                        Potential Concerns
                      </Label>
                      <ul className="space-y-1">
                        {enrichmentResult.potentialConcerns.map((c, i) => (
                          <li key={i} className="text-sm flex items-start gap-1.5">
                            <span className="text-orange-600 mt-0.5">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Communication & Decision Style */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-indigo-500/10 border-indigo-500/20">
                      <Label className="text-xs text-indigo-700">Communication Style</Label>
                      <p className="text-sm mt-1">{enrichmentResult.communicationStyle}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-teal-500/10 border-teal-500/20">
                      <Label className="text-xs text-teal-700">Decision-Making Style</Label>
                      <p className="text-sm mt-1">{enrichmentResult.decisionMakingStyle}</p>
                    </div>
                  </div>

                  {/* Rapport Builders */}
                  {enrichmentResult.rapportBuilders.length > 0 && (
                    <div className="p-3 rounded-lg border bg-pink-500/10 border-pink-500/20">
                      <Label className="text-xs text-pink-700 mb-2 block">Rapport Builders</Label>
                      <div className="flex flex-wrap gap-2">
                        {enrichmentResult.rapportBuilders.map((r, i) => (
                          <Badge key={i} variant="secondary" className="bg-pink-100 text-pink-800">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Approach */}
                  <div className="p-3 rounded-lg border-2 border-green-500/30 bg-green-500/10">
                    <Label className="text-xs text-green-700 flex items-center gap-1 mb-2">
                      <GraduationCap className="w-3 h-3" />
                      Recommended Approach
                    </Label>
                    <p className="text-sm text-green-900">{enrichmentResult.recommendedApproach}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="linkedin" className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-blue-600/10 border border-blue-600/20">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">LinkedIn Profile Reference</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Paste the contact's LinkedIn URL to keep as a reference. This will be saved with the contact for future reference.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn Profile URL</Label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  data-testid="input-linkedin-url"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Due to LinkedIn API restrictions, we cannot automatically fetch profile data. The URL will be stored as a reference.
              </p>
            </TabsContent>

            <TabsContent value="data" className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Data Enrichment Services</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Professional data enrichment services like Clearbit, Apollo, or ZoomInfo can provide verified contact information.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center py-6">
                <Badge variant="outline" className="text-muted-foreground">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Data enrichment integrations are on our roadmap.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEnrichmentDialog(false)}>
              Close
            </Button>
            {enrichmentResult && enrichmentMethod === "ai" && (
              <Button onClick={applyEnrichment} className="gap-2" data-testid="button-apply-enrichment">
                <CheckCircle className="w-4 h-4" />
                Apply Insights to Green Sheet
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
