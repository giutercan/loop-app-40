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
  DialogTrigger,
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
  User,
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
  ChevronUp,
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
  Copy,
  BookOpen,
  Pencil,
  PlayCircle,
  Film,
  Brain,
  Wrench,
  Link2,
  Send,
  Mic,
  Trash2,
  Undo2,
  Edit2,
  ArrowRightCircle
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
  OUTCOME_JOURNEY_TEMPLATES,
  type ValuePillarId,
  type SolutionPatternId,
  type JourneyPhase,
  type QuickWin,
  type KeyMilestone
} from "@shared/value-frameworks";
import { DemoModeButton } from "@/demo/DemoModeButton";
import { useDemoMode } from "@/demo/DemoModeContext";
import { JourneyLoopVisualizer } from "@/components/JourneyLoopVisualizer";
import { UnifiedJourneyTimeline } from "@/components/UnifiedJourneyTimeline";
import CompetitiveIntelligence from "@/components/CompetitiveIntelligence";
import { StrategicAlignmentSelector } from "@/components/StrategicAlignmentSelector";
import { JOURNEY_LOOP_STAGES, UNIFIED_JOURNEY_PHASES, createUnifiedJourney } from "@shared/value-frameworks";
import { VoiceCommandOverlay, FloatingVoiceButton } from "@/components/VoiceCommandOverlay";

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

function generateSimulatedSalesforceData(companyName: string): { 
  opportunities: EnhancedOpportunity[]; 
  contacts: SalesforceContact[]; 
  crossOpportunityInfluences: { name: string; title: string; role: string; opportunities: string[]; }[];
  dealHistory: { id: string; name: string; amount: number; closeDate: string; status: "won" | "lost"; competitor?: string; winLossReason: string; }[];
  competitorStats: Record<string, { wins: number; losses: number; deals: string[] }>;
} {
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
  
  // Historical deals with win/loss status and competitors
  const dealHistory: { 
    id: string; 
    name: string; 
    amount: number; 
    closeDate: string; 
    status: "won" | "lost"; 
    competitor?: string; 
    winLossReason: string;
  }[] = [
    {
      id: "HIST-001",
      name: `${companyName} - Executive Coaching Program`,
      amount: 420000,
      closeDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "won",
      competitor: "DDI",
      winLossReason: "Strong executive relationships and proven coaching methodology"
    },
    {
      id: "HIST-002",
      name: `${companyName} - Succession Planning Assessment`,
      amount: 280000,
      closeDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "won",
      competitor: "Heidrick & Struggles",
      winLossReason: "Comprehensive assessment tools and industry benchmarks"
    },
    {
      id: "HIST-003",
      name: `${companyName} - Sales Force Transformation`,
      amount: 650000,
      closeDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "lost",
      competitor: "McKinsey",
      winLossReason: "Lost on price; McKinsey offered bundled consulting services"
    },
    {
      id: "HIST-004",
      name: `${companyName} - Culture Assessment`,
      amount: 150000,
      closeDate: new Date(Date.now() - 540 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "won",
      winLossReason: "No competitor - sole source based on prior relationship"
    },
    {
      id: "HIST-005",
      name: `${companyName} - Compensation Benchmarking`,
      amount: 95000,
      closeDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "lost",
      competitor: "Mercer",
      winLossReason: "Lost due to Mercer's deeper compensation data in their specific industry"
    }
  ];

  // Aggregate competitor win/loss record
  const competitorStats: Record<string, { wins: number; losses: number; deals: string[] }> = {};
  dealHistory.forEach(deal => {
    if (deal.competitor) {
      if (!competitorStats[deal.competitor]) {
        competitorStats[deal.competitor] = { wins: 0, losses: 0, deals: [] };
      }
      if (deal.status === "won") {
        competitorStats[deal.competitor].wins++;
      } else {
        competitorStats[deal.competitor].losses++;
      }
      competitorStats[deal.competitor].deals.push(deal.name);
    }
  });

  // Also track competitors in current opportunities (from red flags)
  opportunities.forEach(opp => {
    opp.redFlags.forEach(flag => {
      if (flag.toLowerCase().includes("competitor")) {
        const match = flag.match(/\(([^)]+)\)/);
        if (match) {
          const compName = match[1];
          if (!competitorStats[compName]) {
            competitorStats[compName] = { wins: 0, losses: 0, deals: [] };
          }
          competitorStats[compName].deals.push(opp.name + " (current)");
        }
      }
    });
  });
  
  return { opportunities, contacts, crossOpportunityInfluences, dealHistory, competitorStats };
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

interface DiscoverySynthesis {
  whatWeLearned: {
    keyThemes: Array<{ theme: string; insight: string; evidence: string[] }>;
    summary: string;
  };
  businessImplications: {
    opportunities: Array<{ title: string; description: string; kornFerryPillar: string; potentialValue: string; priority: "high" | "medium" | "low" }>;
    risks: Array<{ title: string; description: string; mitigation: string }>;
    summary: string;
  };
  stakeholderSignals: {
    championStatus: string;
    buyingCommittee: string;
    momentum: "strong" | "moderate" | "weak" | "unclear";
    nextActions: string[];
    summary: string;
  };
  readinessToBuildValue: {
    score: number;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
    nextSteps: string[];
    summary: string;
  };
  executiveSummary: string;
  generatedAt?: string;
}

function DiscoverySummaryStep({ 
  projectId, 
  project, 
  themeName,
  onBackToQuestions,
  onStartNewDiscovery,
  onContinueToBuildValue
}: { 
  projectId: number; 
  project: Project;
  themeName: string;
  onBackToQuestions: () => void;
  onStartNewDiscovery: () => void;
  onContinueToBuildValue: () => void;
}) {
  const { toast } = useToast();
  
  const { data: synthesis, isLoading, isError, refetch } = useQuery<DiscoverySynthesis | null>({
    queryKey: ["/api/projects", projectId, "discovery-insights", "summary"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/projects/${projectId}/discovery-insights/summary`);
        return await res.json();
      } catch (err: any) {
        if (err?.message?.startsWith("404:")) return null;
        throw err;
      }
    },
    enabled: projectId > 0,
    retry: false,
    staleTime: 1000 * 60 * 5
  });
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/projects/${projectId}/discovery-insights/summary`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-insights", "summary"] });
      await refetch();
      toast({ title: "Insights Generated", description: "AI has synthesized your discovery data into strategic insights." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate insights. Please try again.", variant: "destructive" });
    }
  });
  
  const generateMarkdownContent = () => {
    if (!synthesis) return "";
    const lines: string[] = [];
    lines.push(`# Discovery Insights - ${project.companyName || themeName}`);
    lines.push(`Generated: ${synthesis.generatedAt ? new Date(synthesis.generatedAt).toLocaleString() : new Date().toLocaleString()}`);
    lines.push("");
    lines.push("## Executive Summary");
    lines.push(synthesis.executiveSummary);
    lines.push("");
    lines.push("## What We Learned");
    lines.push(synthesis.whatWeLearned.summary);
    synthesis.whatWeLearned.keyThemes.forEach((theme, i) => {
      lines.push(`### ${i + 1}. ${theme.theme}`);
      lines.push(theme.insight);
      if (theme.evidence.length) lines.push(`Evidence: ${theme.evidence.join(", ")}`);
      lines.push("");
    });
    lines.push("## Business Implications");
    lines.push(synthesis.businessImplications.summary);
    lines.push("### Opportunities");
    synthesis.businessImplications.opportunities.forEach(opp => {
      lines.push(`- **${opp.title}** (${opp.priority} priority, ${opp.kornFerryPillar}): ${opp.description} - ${opp.potentialValue}`);
    });
    if (synthesis.businessImplications.risks.length) {
      lines.push("### Risks");
      synthesis.businessImplications.risks.forEach(r => {
        lines.push(`- **${r.title}**: ${r.description} (Mitigation: ${r.mitigation})`);
      });
    }
    lines.push("");
    lines.push("## Stakeholder Signals");
    lines.push(synthesis.stakeholderSignals.summary);
    lines.push(`- Champion Status: ${synthesis.stakeholderSignals.championStatus}`);
    lines.push(`- Buying Committee: ${synthesis.stakeholderSignals.buyingCommittee}`);
    lines.push(`- Momentum: ${synthesis.stakeholderSignals.momentum}`);
    if (synthesis.stakeholderSignals.nextActions.length) {
      lines.push("### Next Actions");
      synthesis.stakeholderSignals.nextActions.forEach(a => lines.push(`- ${a}`));
    }
    lines.push("");
    lines.push("## Readiness to Design Outcomes");
    lines.push(`Score: ${synthesis.readinessToBuildValue.score}%`);
    lines.push(synthesis.readinessToBuildValue.summary);
    lines.push("### Strengths");
    synthesis.readinessToBuildValue.strengths.forEach(s => lines.push(`+ ${s}`));
    lines.push("### Gaps");
    synthesis.readinessToBuildValue.gaps.forEach(g => lines.push(`- ${g}`));
    if (synthesis.readinessToBuildValue.nextSteps.length) {
      lines.push("### Recommended Next Steps");
      synthesis.readinessToBuildValue.nextSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    }
    return lines.join("\n");
  };
  
  const handleCopyMarkdown = () => {
    const content = generateMarkdownContent();
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Insights copied to clipboard as markdown" });
  };
  
  const handleDownloadMarkdown = () => {
    const content = generateMarkdownContent();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `discovery-insights-${themeName?.toLowerCase().replace(/\s+/g, "-") || "summary"}-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Insights saved as markdown file" });
  };
  
  const priorityColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-700 border-red-500/30",
    medium: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    low: "bg-blue-500/10 text-blue-700 border-blue-500/30"
  };
  
  const momentumColors: Record<string, { bg: string; text: string }> = {
    strong: { bg: "bg-emerald-500", text: "Strong" },
    moderate: { bg: "bg-amber-500", text: "Moderate" },
    weak: { bg: "bg-red-500", text: "Weak" },
    unclear: { bg: "bg-gray-400", text: "Unclear" }
  };
  
  if (isLoading) {
    return (
      <Card className="border-primary/20" data-testid="card-loading-insights">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Loading Discovery Insights</p>
              <p className="text-sm text-muted-foreground">Retrieving your strategic analysis...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="border-destructive/20" data-testid="card-error-insights">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <div className="text-center">
              <p className="font-medium">Failed to Load Insights</p>
              <p className="text-sm text-muted-foreground mb-4">There was an error loading your discovery insights.</p>
              <Button variant="outline" onClick={() => refetch()} data-testid="button-retry-load">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!synthesis) {
    return (
      <>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5" data-testid="card-generate-insights">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Generate Strategic Insights</CardTitle>
                <CardDescription>AI will analyze all your discovery data and synthesize actionable business insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="p-3 rounded-lg border bg-background/50 text-center" data-testid="source-research">
                  <FileSearch className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs font-medium">Research Data</p>
                  <p className="text-[10px] text-muted-foreground">Company intelligence</p>
                </div>
                <div className="p-3 rounded-lg border bg-background/50 text-center" data-testid="source-stakeholder">
                  <Users className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs font-medium">Stakeholder Info</p>
                  <p className="text-[10px] text-muted-foreground">Green Sheet contacts</p>
                </div>
                <div className="p-3 rounded-lg border bg-background/50 text-center" data-testid="source-narrative">
                  <MessageSquare className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <p className="text-xs font-medium">Narrative Content</p>
                  <p className="text-[10px] text-muted-foreground">Story builder data</p>
                </div>
                <div className="p-3 rounded-lg border bg-background/50 text-center" data-testid="source-questions">
                  <ClipboardList className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <p className="text-xs font-medium">Question Responses</p>
                  <p className="text-[10px] text-muted-foreground">Discovery answers</p>
                </div>
              </div>
              <Button 
                onClick={() => generateMutation.mutate()} 
                disabled={generateMutation.isPending}
                className="w-full gap-2"
                size="lg"
                data-testid="button-generate-insights"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Discovery Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Strategic Insights
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBackToQuestions} data-testid="button-back-to-questions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Client Interaction
          </Button>
          <Button variant="outline" onClick={onStartNewDiscovery} data-testid="button-start-new-discovery">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Start New Discovery
          </Button>
        </div>
      </>
    );
  }
  
  return (
    <>
      {/* Executive Summary Header */}
      <Card className="bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 border-emerald-500/20" data-testid="card-discovery-insights">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Discovery Insights
                  <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                    AI Generated
                  </Badge>
                </CardTitle>
                <CardDescription>Strategic intelligence for {themeName}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {synthesis.generatedAt && (
                <Badge variant="outline" className="text-xs" data-testid="badge-generated-at">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(synthesis.generatedAt).toLocaleString()}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown} title="Copy to clipboard" data-testid="button-copy-markdown">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} title="Download as Markdown" data-testid="button-download-markdown">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} data-testid="button-regenerate-insights">
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-background/50 border" data-testid="text-executive-summary">
            <p className="text-sm leading-relaxed">{synthesis.executiveSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* What We Learned */}
      <Card className="border-blue-500/20" data-testid="card-what-we-learned">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            What We Learned
          </CardTitle>
          <CardDescription>{synthesis.whatWeLearned.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {synthesis.whatWeLearned.keyThemes.map((theme, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20" data-testid={`theme-card-${idx}`}>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2" data-testid={`theme-title-${idx}`}>
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-700">{idx + 1}</div>
                  {theme.theme}
                </h4>
                <p className="text-sm text-muted-foreground mb-3" data-testid={`theme-insight-${idx}`}>{theme.insight}</p>
                <div className="flex flex-wrap gap-1">
                  {theme.evidence.map((ev, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-background" data-testid={`evidence-badge-${idx}-${i}`}>
                      {ev.length > 50 ? ev.substring(0, 50) + "..." : ev}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Implications */}
      <Card className="border-purple-500/20" data-testid="card-business-implications">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Business Implications
          </CardTitle>
          <CardDescription>{synthesis.businessImplications.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Opportunities */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Opportunities
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {synthesis.businessImplications.opportunities.map((opp, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20" data-testid={`opportunity-card-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm" data-testid={`opportunity-title-${idx}`}>{opp.title}</h5>
                      <Badge className={priorityColors[opp.priority]} data-testid={`opportunity-priority-${idx}`}>
                        {opp.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2" data-testid={`opportunity-desc-${idx}`}>{opp.description}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <Badge variant="outline" data-testid={`opportunity-pillar-${idx}`}>{opp.kornFerryPillar}</Badge>
                      <span className="text-emerald-600 font-medium" data-testid={`opportunity-value-${idx}`}>{opp.potentialValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Risks */}
            {synthesis.businessImplications.risks.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Risks to Consider
                </h4>
                <div className="space-y-2">
                  {synthesis.businessImplications.risks.map((risk, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20" data-testid={`risk-card-${idx}`}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-sm" data-testid={`risk-title-${idx}`}>{risk.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`risk-desc-${idx}`}>{risk.description}</p>
                          <p className="text-xs text-emerald-600 mt-1" data-testid={`risk-mitigation-${idx}`}><strong>Mitigation:</strong> {risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Signals */}
      <Card className="border-amber-500/20" data-testid="card-stakeholder-signals">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            Stakeholder Signals
          </CardTitle>
          <CardDescription>{synthesis.stakeholderSignals.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="p-4 rounded-lg border bg-background" data-testid="stakeholder-champion">
              <p className="text-xs text-muted-foreground mb-1">Champion Status</p>
              <p className="text-sm font-medium" data-testid="text-champion-status">{synthesis.stakeholderSignals.championStatus}</p>
            </div>
            <div className="p-4 rounded-lg border bg-background" data-testid="stakeholder-committee">
              <p className="text-xs text-muted-foreground mb-1">Buying Committee</p>
              <p className="text-sm font-medium" data-testid="text-buying-committee">{synthesis.stakeholderSignals.buyingCommittee}</p>
            </div>
            <div className="p-4 rounded-lg border bg-background" data-testid="stakeholder-momentum">
              <p className="text-xs text-muted-foreground mb-1">Deal Momentum</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${momentumColors[synthesis.stakeholderSignals.momentum]?.bg}`} data-testid="momentum-indicator" />
                <span className="text-sm font-medium" data-testid="momentum-text">{momentumColors[synthesis.stakeholderSignals.momentum]?.text}</span>
              </div>
            </div>
          </div>
          {synthesis.stakeholderSignals.nextActions.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2">Recommended Stakeholder Actions</p>
              <div className="space-y-1">
                {synthesis.stakeholderSignals.nextActions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm" data-testid={`stakeholder-action-${idx}`}>
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readiness to Design Outcomes */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-emerald-500/5" data-testid="card-readiness">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Readiness to Design Outcomes
              </CardTitle>
              <CardDescription>{synthesis.readinessToBuildValue.summary}</CardDescription>
            </div>
            <div className="text-center" data-testid="readiness-score-chart">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/20" />
                  <circle 
                    cx="40" cy="40" r="35" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    fill="none" 
                    className={synthesis.readinessToBuildValue.score >= 70 ? "text-emerald-500" : synthesis.readinessToBuildValue.score >= 40 ? "text-amber-500" : "text-red-500"}
                    strokeDasharray={`${(synthesis.readinessToBuildValue.score / 100) * 220} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold" data-testid="readiness-score">{synthesis.readinessToBuildValue.score}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div data-testid="readiness-strengths">
              <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Strengths
              </h4>
              <ul className="space-y-1">
                {synthesis.readinessToBuildValue.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2" data-testid={`strength-item-${i}`}>
                    <span className="text-emerald-500 mt-1">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div data-testid="readiness-gaps">
              <h4 className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Gaps
              </h4>
              <ul className="space-y-1">
                {synthesis.readinessToBuildValue.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2" data-testid={`gap-item-${i}`}>
                    <span className="text-amber-500 mt-1">-</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {synthesis.readinessToBuildValue.nextSteps.length > 0 && (
            <div className="p-3 rounded-lg border bg-background mb-4" data-testid="readiness-next-steps">
              <h4 className="text-xs font-semibold mb-2">Recommended Next Steps</h4>
              <div className="space-y-1">
                {synthesis.readinessToBuildValue.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" data-testid={`next-step-${i}`}>
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground" data-testid="text-readiness-footer">
              Ready to define measurable outcomes and create commitments.
            </p>
            <Button onClick={onContinueToBuildValue} className="gap-2" data-testid="button-continue-to-design">
              Continue to Design Outcomes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBackToQuestions} data-testid="button-back-to-questions">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Client Interaction
        </Button>
        <Button variant="outline" onClick={onStartNewDiscovery} data-testid="button-start-new-discovery">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Start New Discovery
        </Button>
      </div>
    </>
  );
}

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
  const [discoveryStep, setDiscoveryStepLocal] = useState<"theme-select" | "intelligence" | "questions" | "insights">("theme-select");
  const [buildValueSection, setBuildValueSection] = useState<"commitments" | "stories">("commitments");
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
  
  // Korn Ferry success story suggestions
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);
  const [suggestedStories, setSuggestedStories] = useState<{
    title: string;
    client: string;
    industry: string;
    solution: string;
    outcome: string;
    relevance: string;
    url: string;
  }[]>([]);
  
  // Live Intelligence data (replaces demo data)
  interface LiveIntelligenceData {
    companyOverview: {
      description: string;
      industry: string;
      headquarters: string;
      employeeCount: string;
      revenue: string;
      founded: string;
    };
    recentNews: Array<{
      date: string;
      headline: string;
      source: string;
      summary: string;
      relevance: "high" | "medium" | "low";
      opportunityType?: string;
    }>;
    competitors: Array<{
      name: string;
      description: string;
      competitivePosition: string;
    }>;
    strategicInsights: Array<{
      title: string;
      insight: string;
      kfOpportunity: string;
      potentialValue: string;
      relevantCapability: string;
    }>;
    keyPeople: Array<{
      name: string;
      title: string;
      relevance: string;
    }>;
    themeSpecificInsights: {
      opportunitySignal: string;
      howWeHelp: string[];
      potentialValue: string;
      keyQuestions: string[];
    };
    generatedAt: string;
  }
  
  const [liveIntelligence, setLiveIntelligence] = useState<LiveIntelligenceData | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
  const [intelligenceIsSaved, setIntelligenceIsSaved] = useState(false);
  
  // Probe chat state
  const [probeQuestion, setProbeQuestion] = useState("");
  const [probeHistory, setProbeHistory] = useState<Array<{role: "user" | "assistant"; content: string; timestamp: string}>>([]);
  const [isProbing, setIsProbing] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  
  // Mutation to probe the intelligence (ask follow-up questions)
  const probeIntelligenceMutation = useMutation({
    mutationFn: async ({ theme, question }: { theme: string; question: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/intelligence/${theme}/probe`, { question });
      return await res.json() as { question: string; answer: string; timestamp: string };
    },
    onSuccess: (data) => {
      setProbeHistory(prev => [
        ...prev,
        { role: "user" as const, content: data.question, timestamp: data.timestamp },
        { role: "assistant" as const, content: data.answer, timestamp: data.timestamp }
      ]);
      setProbeQuestion("");
      setIsProbing(false);
    },
    onError: (error: any) => {
      console.error("Failed to probe intelligence:", error);
      setIsProbing(false);
      toast({ 
        title: "Question Failed", 
        description: "Could not process your question. Please try again.", 
        variant: "destructive" 
      });
    }
  });
  
  // Track which theme's intelligence is currently loaded and if user triggered refresh
  const loadedIntelligenceThemeRef = useRef<string | null>(null);
  const isManualRefreshRef = useRef(false);
  
  // Mutation to fetch live intelligence (generate new)
  const fetchLiveIntelligenceMutation = useMutation({
    mutationFn: async (discoveryTheme: string) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/live-intelligence`, { discoveryTheme });
      return await res.json() as LiveIntelligenceData;
    },
    onSuccess: (data) => {
      setLiveIntelligence(data);
      setIsLoadingIntelligence(false);
      setIntelligenceError(null);
      setIntelligenceIsSaved(true);
      setProbeHistory([]);
      isManualRefreshRef.current = false;
    },
    onError: (error: any) => {
      console.error("Failed to fetch live intelligence:", error);
      setIsLoadingIntelligence(false);
      setIntelligenceError(error.message || "Failed to generate company intelligence");
      isManualRefreshRef.current = false;
      toast({ 
        title: "Intelligence Generation Failed", 
        description: "Could not fetch live company data. Please try again.", 
        variant: "destructive" 
      });
    }
  });
  
  // Auto-fetch intelligence when moving to intelligence step (try loading saved first)
  useEffect(() => {
    const loadIntelligence = async () => {
      // Only load if we're on the intelligence step and have a theme
      if (discoveryStep !== "intelligence" || !selectedDiscoveryTheme) {
        return;
      }
      
      // Skip if already loading (manual refresh or other operation in progress)
      if (isLoadingIntelligence) {
        return;
      }
      
      // Skip if we already have intelligence for this theme
      if (liveIntelligence && loadedIntelligenceThemeRef.current === selectedDiscoveryTheme) {
        return;
      }
      
      // Skip if user is manually refreshing - let the mutation handle it
      if (isManualRefreshRef.current) {
        return;
      }
      
      // If theme changed, reset state and track the new theme
      if (loadedIntelligenceThemeRef.current !== selectedDiscoveryTheme) {
        loadedIntelligenceThemeRef.current = selectedDiscoveryTheme;
        setLiveIntelligence(null);
        setIntelligenceError(null);
        setIntelligenceIsSaved(false);
        setProbeHistory([]);
      }
      
      setIsLoadingIntelligence(true);
      
      // Try to load saved intelligence first
      try {
        const savedRes = await fetch(`/api/projects/${projectId}/intelligence/${selectedDiscoveryTheme}`);
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setLiveIntelligence(savedData as LiveIntelligenceData);
          setIntelligenceIsSaved(true);
          setProbeHistory(savedData.probeHistory || []);
          setIsLoadingIntelligence(false);
          return;
        }
      } catch (e) {
        // No saved intelligence, will show prompt to generate
      }
      
      // No saved intelligence found - show prompt instead of auto-generating
      setIsLoadingIntelligence(false);
    };
    loadIntelligence();
  }, [discoveryStep, selectedDiscoveryTheme, projectId]);
  
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
  const [greenSheetInitialized, setGreenSheetInitialized] = useState(false);
  const [lastSavedGreenSheet, setLastSavedGreenSheet] = useState<string | null>(null);
  
  // Adaptive Meeting Profile state (single vs multiple attendees)
  type MeetingAttendee = {
    id: string;
    name: string;
    title: string;
    role: BuyingRole;
    influence: InfluenceLevel;
    knownConcerns: string;
    preferredOutcomes: string;
    personalRapport: string;
    decisionCriteria: string;
  };
  
  type CombinedMeetingStory = {
    narrative: string;
    keyThemes: string[];
    talkingPoints: Array<{ point: string; targetAudience: string[] }>;
    objectionHandling: Array<{ objection: string; response: string; relevantTo: string[] }>;
    agenda: Array<{ topic: string; duration: string; leadWith: string }>;
    proofPoints: Array<{ claim: string; evidence: string; resonatesWith: string[] }>;
    generatedAt: string;
  };
  
  type MeetingQuestion = {
    id: string;
    question: string;
    methodology: "SPIN" | "Miller Heiman" | "PSS";
    stage: string;
    targetRole?: string;
    followUpHint: string;
    response?: string;
    isAsked: boolean;
  };
  
  type TranscriptAnalysis = {
    summary: string;
    keyInsights: string[];
    actionItems: Array<{ item: string; owner: string; dueDate?: string }>;
    stakeholderSentiment: Record<string, { sentiment: string; signals: string[] }>;
    coachingNotes: Array<{ area: string; observation: string; suggestion: string }>;
    followUpQuestions: string[];
    analyzedAt: string;
  };
  
  const [meetingMode, setMeetingMode] = useState<"single" | "multiple">("single");
  const [meetingAttendees, setMeetingAttendees] = useState<MeetingAttendee[]>([]);
  const [meetingObjective, setMeetingObjective] = useState("");
  const [meetingDesiredOutcome, setMeetingDesiredOutcome] = useState("");
  const [combinedMeetingStory, setCombinedMeetingStory] = useState<CombinedMeetingStory | null>(null);
  const [meetingQuestions, setMeetingQuestions] = useState<MeetingQuestion[]>([]);
  const [meetingTranscript, setMeetingTranscript] = useState("");
  const [transcriptAnalysis, setTranscriptAnalysis] = useState<TranscriptAnalysis | null>(null);
  const [meetingProfileLoaded, setMeetingProfileLoaded] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingMeetingQuestions, setIsGeneratingMeetingQuestions] = useState(false);
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState(false);
  const [showAddAttendeeDialog, setShowAddAttendeeDialog] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<MeetingAttendee | null>(null);
  
  const [isVoiceCommandOpen, setIsVoiceCommandOpen] = useState(false);
  const [voiceTargetField, setVoiceTargetField] = useState<string | undefined>();
  
  const voiceCommandFields = [
    { id: "objective", label: "Call Objective", category: "greensheet" as const, icon: Target },
    { id: "openingStatement", label: "Opening Statement", category: "greensheet" as const, icon: MessageCircle },
    { id: "desiredOutcome", label: "Desired Outcome", category: "greensheet" as const, icon: CheckCircle },
    { id: "bestActionCommitment", label: "Best Action", category: "greensheet" as const, icon: ArrowRight },
    { id: "singleMessage", label: "Single Message", category: "story" as const, icon: MessageSquare },
    { id: "startingHook", label: "Starting Hook", category: "story" as const, icon: Zap },
    { id: "heroCharacter", label: "Hero/Characters", category: "story" as const, icon: User },
    { id: "openingLine", label: "Opening Line", category: "story" as const, icon: Play },
    { id: "turningPoint", label: "Turning Point", category: "story" as const, icon: TrendingUp },
    { id: "momentOfMeaning", label: "Moment of Meaning", category: "story" as const, icon: Sparkles },
    { id: "explicitTakeaway", label: "Takeaway", category: "story" as const, icon: Lightbulb },
    { id: "callToAction", label: "Call to Action", category: "story" as const, icon: Target },
  ];
  
  const handleVoiceTranscript = useCallback((transcript: string, targetField?: string) => {
    if (transcript.startsWith("__PHASE__")) {
      const phase = transcript.replace("__PHASE__", "") as "before" | "during" | "after";
      setActiveStoryPhase(phase);
      return;
    }
    
    let fieldUpdated = false;
    
    if (targetField) {
      if (["objective", "openingStatement", "desiredOutcome", "bestActionCommitment"].includes(targetField)) {
        setGreenSheetEdits(prev => ({ ...prev, [targetField]: transcript }));
        fieldUpdated = true;
      } else if (["singleMessage", "startingHook", "heroCharacter", "evidenceToReference", "emotionalReaction"].includes(targetField)) {
        setStoryBuilderData(prev => ({
          ...prev,
          before: { ...prev.before, [targetField]: transcript }
        }));
        fieldUpdated = true;
      } else if (["openingLine", "turningPoint", "keyDataPoints"].includes(targetField)) {
        setStoryBuilderData(prev => ({
          ...prev,
          during: { ...prev.during, [targetField]: transcript }
        }));
        fieldUpdated = true;
      } else if (["momentOfMeaning", "explicitTakeaway", "callToAction"].includes(targetField)) {
        setStoryBuilderData(prev => ({
          ...prev,
          after: { ...prev.after, [targetField]: transcript }
        }));
        fieldUpdated = true;
      }
      
      if (fieldUpdated) {
        toast({
          title: "Voice input added",
          description: `Added to ${voiceCommandFields.find(f => f.id === targetField)?.label || targetField}`,
        });
      } else {
        toast({
          title: "Field not recognized",
          description: `Could not find field: ${targetField}. Transcript: ${transcript.slice(0, 30)}...`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Transcript captured",
        description: transcript.slice(0, 50) + (transcript.length > 50 ? "..." : ""),
      });
    }
    
    setIsVoiceCommandOpen(false);
  }, [toast]);
  
  // Mutation to save Green Sheet data
  const saveGreenSheetMutation = useMutation({
    mutationFn: async (data: { meetingContact: typeof meetingContact; callPlanner: typeof greenSheetEdits }) => {
      return await apiRequest("PATCH", `/api/projects/${projectId}/green-sheet`, data);
    },
    onSuccess: () => {
      setLastSavedGreenSheet(new Date().toLocaleTimeString());
    },
    onError: () => {
      setLastSavedGreenSheet(null);
      toast({ title: "Failed to save Green Sheet", description: "Your changes may not be saved. Please try again.", variant: "destructive" });
    }
  });
  
  // Store stable mutate reference for Green Sheet
  const greenSheetMutateRef = useRef(saveGreenSheetMutation.mutate);
  useEffect(() => {
    greenSheetMutateRef.current = saveGreenSheetMutation.mutate;
  }, [saveGreenSheetMutation.mutate]);
  
  // Debounced auto-save for Green Sheet with change detection
  const greenSheetSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedGreenSheetDataRef = useRef<string>("");
  
  const saveGreenSheetDebounced = useCallback((data: { meetingContact: typeof meetingContact; callPlanner: typeof greenSheetEdits }) => {
    // Deep comparison using JSON stringify to prevent save storms
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedGreenSheetDataRef.current) {
      return; // No changes, skip save
    }
    
    if (greenSheetSaveTimeoutRef.current) {
      clearTimeout(greenSheetSaveTimeoutRef.current);
    }
    greenSheetSaveTimeoutRef.current = setTimeout(() => {
      lastSavedGreenSheetDataRef.current = dataString;
      greenSheetMutateRef.current(data);
    }, 1500);
  }, []);
  
  // Cleanup Green Sheet timeout on unmount
  useEffect(() => {
    return () => {
      if (greenSheetSaveTimeoutRef.current) {
        clearTimeout(greenSheetSaveTimeoutRef.current);
      }
    };
  }, []);
  
  // Auto-save Green Sheet when data changes - compare inside effect, not in deps
  useEffect(() => {
    if (!greenSheetInitialized) return;
    const currentData = JSON.stringify({ meetingContact, callPlanner: greenSheetEdits });
    // Only trigger save if data actually changed from what was saved
    if (currentData !== lastSavedGreenSheetDataRef.current) {
      saveGreenSheetDebounced({ meetingContact, callPlanner: greenSheetEdits });
    }
  }, [meetingContact, greenSheetEdits, greenSheetInitialized, saveGreenSheetDebounced]);
  
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
  
  // Meeting Profile API functions
  const loadMeetingProfile = useCallback(async () => {
    if (!projectId || meetingProfileLoaded) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/meeting-profile`);
      if (response.ok) {
        const profile = await response.json();
        setMeetingMode(profile.attendanceMode || "single");
        setMeetingAttendees(profile.participants || []);
        setMeetingObjective(profile.meetingObjective || "");
        setMeetingDesiredOutcome(profile.desiredOutcome || "");
        setCombinedMeetingStory(profile.combinedMeetingStory || null);
        setMeetingQuestions(profile.generatedQuestions || []);
        setMeetingTranscript(profile.transcript || "");
        setTranscriptAnalysis(profile.transcriptAnalysis || null);
        if (profile.singleContact) {
          setMeetingContact(prev => ({
            ...prev,
            ...profile.singleContact
          }));
        }
      }
      setMeetingProfileLoaded(true);
    } catch (error) {
      console.error("Failed to load meeting profile:", error);
      setMeetingProfileLoaded(true);
    }
  }, [projectId, meetingProfileLoaded]);
  
  // Save meeting profile mutation
  const saveMeetingProfileMutation = useMutation({
    mutationFn: async (data: {
      attendanceMode: "single" | "multiple";
      participants?: MeetingAttendee[];
      singleContact?: typeof meetingContact;
      meetingObjective?: string;
      desiredOutcome?: string;
      combinedMeetingStory?: CombinedMeetingStory | null;
      generatedQuestions?: MeetingQuestion[];
      transcript?: string;
      transcriptAnalysis?: TranscriptAnalysis | null;
    }) => {
      return await apiRequest("POST", `/api/projects/${projectId}/meeting-profile`, data);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save meeting profile",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Auto-save meeting profile when mode or attendees change
  const meetingProfileSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!meetingProfileLoaded) return;
    
    if (meetingProfileSaveTimeoutRef.current) {
      clearTimeout(meetingProfileSaveTimeoutRef.current);
    }
    
    meetingProfileSaveTimeoutRef.current = setTimeout(() => {
      saveMeetingProfileMutation.mutate({
        attendanceMode: meetingMode,
        participants: meetingAttendees,
        singleContact: meetingMode === "single" ? meetingContact : undefined,
        meetingObjective,
        desiredOutcome: meetingDesiredOutcome,
        combinedMeetingStory,
        generatedQuestions: meetingQuestions,
        transcript: meetingTranscript,
        transcriptAnalysis
      });
    }, 2000);
    
    return () => {
      if (meetingProfileSaveTimeoutRef.current) {
        clearTimeout(meetingProfileSaveTimeoutRef.current);
      }
    };
  }, [meetingMode, meetingAttendees, meetingContact, meetingObjective, meetingDesiredOutcome, meetingProfileLoaded]);
  
  // Load meeting profile when entering questions step
  useEffect(() => {
    if (discoveryStep === "questions" && !meetingProfileLoaded) {
      loadMeetingProfile();
    }
  }, [discoveryStep, loadMeetingProfile, meetingProfileLoaded]);
  
  // Generate methodology questions for meeting profile
  const generateMeetingQuestions = async () => {
    setIsGeneratingMeetingQuestions(true);
    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/meeting-profile/generate-questions`, {});
      const data = await response.json();
      setMeetingQuestions(data.questions || []);
      toast({
        title: "Questions generated",
        description: `Generated ${data.questions?.length || 0} methodology-based questions.`
      });
    } catch (error) {
      toast({
        title: "Failed to generate questions",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMeetingQuestions(false);
    }
  };
  
  // Generate combined meeting story
  const generateMeetingStory = async () => {
    setIsGeneratingStory(true);
    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/meeting-profile/generate-story`, {});
      const data = await response.json();
      setCombinedMeetingStory(data.story || null);
      toast({
        title: "Meeting story generated",
        description: "AI has created a combined narrative for all stakeholders."
      });
    } catch (error) {
      toast({
        title: "Failed to generate story",
        description: "Please ensure you have added meeting attendees.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingStory(false);
    }
  };
  
  // Analyze meeting transcript
  const analyzeMeetingTranscript = async () => {
    if (!meetingTranscript.trim()) {
      toast({
        title: "No transcript",
        description: "Please paste or upload a meeting transcript first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzingTranscript(true);
    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/meeting-profile/analyze-transcript`, {
        transcript: meetingTranscript
      });
      const data = await response.json();
      setTranscriptAnalysis(data.analysis || null);
      toast({
        title: "Transcript analyzed",
        description: "AI has generated insights and coaching from your meeting."
      });
    } catch (error) {
      toast({
        title: "Failed to analyze transcript",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingTranscript(false);
    }
  };
  
  // Add new attendee
  const addAttendee = (attendee: Omit<MeetingAttendee, "id">) => {
    const newAttendee: MeetingAttendee = {
      ...attendee,
      id: `att-${Date.now()}`
    };
    setMeetingAttendees(prev => [...prev, newAttendee]);
    setShowAddAttendeeDialog(false);
  };
  
  // Update attendee
  const updateAttendee = (id: string, updates: Partial<MeetingAttendee>) => {
    setMeetingAttendees(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  
  // Remove attendee
  const removeAttendee = (id: string) => {
    setMeetingAttendees(prev => prev.filter(a => a.id !== id));
  };
  
  // Handle mode switch
  const handleModeSwitch = (newMode: "single" | "multiple") => {
    if (newMode === "single" && meetingAttendees.length > 0) {
      // Switching from multiple to single - archive attendees
      toast({
        title: "Switching to single attendee mode",
        description: `${meetingAttendees.length} attendees will be archived.`
      });
    }
    setMeetingMode(newMode);
    if (newMode === "multiple" && meetingAttendees.length === 0 && meetingContact.name) {
      // Convert single contact to first attendee
      addAttendee({
        name: meetingContact.name,
        title: meetingContact.title,
        role: meetingContact.role || "user_buyer",
        influence: meetingContact.influence || "medium",
        knownConcerns: meetingContact.knownConcerns,
        preferredOutcomes: "",
        personalRapport: meetingContact.personalRapport,
        decisionCriteria: meetingContact.decisionCriteria
      });
    }
  };
  
  // Role-based coaching guidance
  const roleCoaching: Record<BuyingRole, string> = {
    economic_buyer: "Focus on ROI, business impact, and strategic alignment. This person controls the budget—speak to outcomes and value, not features.",
    user_buyer: "Emphasize ease of implementation, day-to-day impact, and how this makes their life easier. They care about practical outcomes.",
    technical_buyer: "Be prepared for detailed questions. Have data, methodology, and proof points ready. They'll screen for fit and feasibility.",
    coach: "Ask for inside information on the buying process. Who else needs to be involved? What concerns should you address proactively?",
    champion: "Equip them to sell internally. Give them the soundbites, data, and stories they can share with others."
  };
  
  // Tension Question type for Story Coach
  type TensionQuestion = {
    id: string;
    prompt: string;
    methodology: "SPIN" | "MILLER_HEIMAN" | "PSS" | "CUSTOM";
    rationale?: string;
    source: "ai" | "manual";
    response: string;
    order: number;
  };
  
  // Interactive Story Builder state - aligned with schema
  const [storyBuilderOpen, setStoryBuilderOpen] = useState(false);
  const [activeStoryPhase, setActiveStoryPhase] = useState<"before" | "during" | "after" | "test">("before");
  const [tensionQuestionsDialogOpen, setTensionQuestionsDialogOpen] = useState(false);
  const [storyBuilderData, setStoryBuilderData] = useState({
    before: {
      singleMessage: "",
      emotionalReaction: "",
      storyStructure: "situation-struggle-insight-outcome",
      startingHook: "",
      heroCharacter: "",
      evidenceToReference: "",
      tensionQuestions: [] as TensionQuestion[]
    },
    during: {
      openingLine: "",
      turningPoint: "",
      keyDataPoints: "",
      pausePoints: [] as string[],
      pacingNotes: ""
    },
    after: {
      momentOfMeaning: "",
      explicitTakeaway: "",
      callToAction: ""
    },
    storyTest: {
      strangerCareScore: null as number | null,
      simplicityScore: null as number | null,
      leadershipValuesScore: null as number | null,
      testNotes: ""
    }
  });
  
  // Legacy storyDraft for backwards compatibility with existing mutation
  const storyDraft = {
    singleMessage: storyBuilderData.before.singleMessage,
    emotionalReaction: storyBuilderData.before.emotionalReaction,
    startingHook: storyBuilderData.before.startingHook,
    structure: storyBuilderData.before.storyStructure,
    heroCharacter: storyBuilderData.before.heroCharacter,
    evidence: storyBuilderData.before.evidenceToReference,
    movingQuestion: storyBuilderData.before.tensionQuestions.map(q => q.prompt).join("; "),
    openingLine: storyBuilderData.during.openingLine,
    turningPoint: storyBuilderData.during.turningPoint,
    keyDataPoint: storyBuilderData.during.keyDataPoints,
    meaningMoment: storyBuilderData.after.momentOfMeaning,
    takeaway: storyBuilderData.after.explicitTakeaway,
    callToAction: storyBuilderData.after.callToAction
  };
  
  const setStoryDraft = (updater: (prev: typeof storyDraft) => typeof storyDraft) => {
    setStoryBuilderData(prev => {
      const updated = updater({
        singleMessage: prev.before.singleMessage,
        emotionalReaction: prev.before.emotionalReaction,
        startingHook: prev.before.startingHook,
        structure: prev.before.storyStructure,
        heroCharacter: prev.before.heroCharacter,
        evidence: prev.before.evidenceToReference,
        movingQuestion: prev.before.tensionQuestions.map(q => q.prompt).join("; "),
        openingLine: prev.during.openingLine,
        turningPoint: prev.during.turningPoint,
        keyDataPoint: prev.during.keyDataPoints,
        meaningMoment: prev.after.momentOfMeaning,
        takeaway: prev.after.explicitTakeaway,
        callToAction: prev.after.callToAction
      });
      return {
        ...prev,
        before: {
          ...prev.before,
          singleMessage: updated.singleMessage,
          emotionalReaction: updated.emotionalReaction,
          startingHook: updated.startingHook,
          storyStructure: updated.structure,
          heroCharacter: updated.heroCharacter,
          evidenceToReference: updated.evidence
          // tensionQuestions is managed separately via addTensionQuestion/removeTensionQuestion
        },
        during: {
          ...prev.during,
          openingLine: updated.openingLine,
          turningPoint: updated.turningPoint,
          keyDataPoints: updated.keyDataPoint
        },
        after: {
          ...prev.after,
          momentOfMeaning: updated.meaningMoment,
          explicitTakeaway: updated.takeaway,
          callToAction: updated.callToAction
        }
      };
    });
  };
  
  const storyTestResults = {
    strangerCare: storyBuilderData.storyTest.strangerCareScore !== null ? storyBuilderData.storyTest.strangerCareScore >= 3 : null,
    simpleEnough: storyBuilderData.storyTest.simplicityScore !== null ? storyBuilderData.storyTest.simplicityScore >= 3 : null,
    revealsMeaning: storyBuilderData.storyTest.leadershipValuesScore !== null ? storyBuilderData.storyTest.leadershipValuesScore >= 3 : null
  };
  
  const setStoryTestResults = (updater: (prev: typeof storyTestResults) => typeof storyTestResults) => {
    setStoryBuilderData(prev => {
      const updated = updater({
        strangerCare: prev.storyTest.strangerCareScore !== null ? prev.storyTest.strangerCareScore >= 3 : null,
        simpleEnough: prev.storyTest.simplicityScore !== null ? prev.storyTest.simplicityScore >= 3 : null,
        revealsMeaning: prev.storyTest.leadershipValuesScore !== null ? prev.storyTest.leadershipValuesScore >= 3 : null
      });
      return {
        ...prev,
        storyTest: {
          ...prev.storyTest,
          strangerCareScore: updated.strangerCare === null ? null : (updated.strangerCare ? 5 : 1),
          simplicityScore: updated.simpleEnough === null ? null : (updated.simpleEnough ? 5 : 1),
          leadershipValuesScore: updated.revealsMeaning === null ? null : (updated.revealsMeaning ? 5 : 1)
        }
      };
    });
  };
  
  // Story Builder persistence
  const [storyBuilderInitialized, setStoryBuilderInitialized] = useState(false);
  const lastSavedStoryBuilderDataRef = useRef<string>("");
  const [storyBuilderLastSaved, setStoryBuilderLastSaved] = useState<string | null>(null);
  
  const pendingSaveDataRef = useRef<string | null>(null);
  const saveVersionRef = useRef<number>(0);
  
  const saveStoryBuilderMutation = useMutation({
    mutationFn: async (data: typeof storyBuilderData & { _version?: number }) => {
      const version = ++saveVersionRef.current;
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/story-builder`, data);
      const result = await response.json();
      return { ...result, _version: version };
    },
    onSuccess: (data: { _version?: number }) => {
      // Ignore stale responses from superseded saves
      if (data._version !== undefined && data._version < saveVersionRef.current) {
        return;
      }
      const now = new Date();
      setStoryBuilderLastSaved(`Saved at ${now.toLocaleTimeString()}`);
      // Only update ref on success - this ensures retries happen on failure
      if (pendingSaveDataRef.current) {
        lastSavedStoryBuilderDataRef.current = pendingSaveDataRef.current;
        pendingSaveDataRef.current = null;
      }
    },
    onError: (error: any) => {
      console.error("Failed to save Story Coach data:", error);
      toast({
        title: "Failed to save",
        description: "Your changes couldn't be saved. Please try again.",
        variant: "destructive"
      });
      // Clear pending so next change triggers a new save
      pendingSaveDataRef.current = null;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });
  
  const saveStoryBuilderDebounced = useCallback((data: typeof storyBuilderData) => {
    const dataString = JSON.stringify(data);
    pendingSaveDataRef.current = dataString;
    
    if (saveStoryBuilderTimeoutRef.current) {
      clearTimeout(saveStoryBuilderTimeoutRef.current);
    }
    saveStoryBuilderTimeoutRef.current = setTimeout(() => {
      saveStoryBuilderMutation.mutate(data);
    }, 1500);
  }, [saveStoryBuilderMutation]);
  
  const saveStoryBuilderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    return () => {
      if (saveStoryBuilderTimeoutRef.current) {
        clearTimeout(saveStoryBuilderTimeoutRef.current);
      }
    };
  }, []);
  
  // Auto-save Story Builder when data changes
  useEffect(() => {
    if (!storyBuilderInitialized) return;
    const currentData = JSON.stringify(storyBuilderData);
    if (currentData !== lastSavedStoryBuilderDataRef.current) {
      saveStoryBuilderDebounced(storyBuilderData);
    }
  }, [storyBuilderData, storyBuilderInitialized, saveStoryBuilderDebounced]);
  
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
        greenSheet: {
          callObjective: greenSheetEdits.objective || "",
          openingStatement: greenSheetEdits.openingStatement || "",
          desiredOutcome: greenSheetEdits.desiredOutcome || "",
          bestActionCommitment: greenSheetEdits.bestActionCommitment || ""
        },
        discoveryTheme: selectedDiscoveryTheme || "General business consulting",
        successStories: stories || [],
        currentDraft: {
          singleMessage: storyBuilderData.before.singleMessage,
          emotionalReaction: storyBuilderData.before.emotionalReaction,
          startingHook: storyBuilderData.before.startingHook,
          structure: storyBuilderData.before.storyStructure,
          heroCharacter: storyBuilderData.before.heroCharacter,
          evidence: storyBuilderData.before.evidenceToReference,
          openingLine: storyBuilderData.during.openingLine,
          turningPoint: storyBuilderData.during.turningPoint,
          momentOfMeaning: storyBuilderData.after.momentOfMeaning,
          explicitTakeaway: storyBuilderData.after.explicitTakeaway,
          callToAction: storyBuilderData.after.callToAction
        },
        fieldToSuggest,
        phase,
        includeIntelligence: true
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.suggestions) {
        const suggestions = data.suggestions;
        setStoryBuilderData(prev => {
          const updated = { ...prev };
          // Update BEFORE phase fields
          if (suggestions.singleMessage) updated.before = { ...updated.before, singleMessage: suggestions.singleMessage };
          if (suggestions.emotionalReaction) updated.before = { ...updated.before, emotionalReaction: suggestions.emotionalReaction };
          if (suggestions.startingHook) updated.before = { ...updated.before, startingHook: suggestions.startingHook };
          if (suggestions.heroCharacter) updated.before = { ...updated.before, heroCharacter: suggestions.heroCharacter };
          if (suggestions.evidence || suggestions.evidenceToReference) updated.before = { ...updated.before, evidenceToReference: suggestions.evidence || suggestions.evidenceToReference };
          // tensionQuestions are managed via the TensionQuestionManager popup, not direct AI suggestion
          // Update DURING phase fields
          if (suggestions.openingLine) updated.during = { ...updated.during, openingLine: suggestions.openingLine };
          if (suggestions.turningPoint) updated.during = { ...updated.during, turningPoint: suggestions.turningPoint };
          // Update AFTER phase fields
          if (suggestions.momentOfMeaning) updated.after = { ...updated.after, momentOfMeaning: suggestions.momentOfMeaning };
          if (suggestions.explicitTakeaway) updated.after = { ...updated.after, explicitTakeaway: suggestions.explicitTakeaway };
          if (suggestions.callToAction) updated.after = { ...updated.after, callToAction: suggestions.callToAction };
          return updated;
        });
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
    // Map "test" phase to "after" for AI suggestions (test phase doesn't need AI)
    const apiPhase = activeStoryPhase === "test" ? "after" : activeStoryPhase;
    storySuggestionMutation.mutate({ fieldToSuggest, phase: apiPhase, stories });
  };
  
  // Tension Questions Dialog state
  const [tensionQuestionsLoading, setTensionQuestionsLoading] = useState(false);
  const [suggestedTensionQuestions, setSuggestedTensionQuestions] = useState<Array<{
    id: string;
    question: string;
    methodology: "SPIN" | "MILLER_HEIMAN" | "PSS";
    stage: string;
    outcome: string;
    followUp: string;
    selected: boolean;
  }>>([]);
  const [customQuestionText, setCustomQuestionText] = useState("");
  
  // Generate tension questions mutation
  const generateTensionQuestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ai/generate-methodology-questions`, {
        companyName: project?.companyName,
        theme: selectedDiscoveryTheme || "Leadership Development",
        contactRole: meetingContact.role,
        contactName: meetingContact.name,
        contactTitle: meetingContact.title,
        contactInfluence: meetingContact.influence,
        knownConcerns: meetingContact.knownConcerns,
        meetingObjective: greenSheetEdits.objective || "",
        desiredOutcome: greenSheetEdits.desiredOutcome || "",
        methodology: "all",
        includeIntelligence: true
      });
      return response.json();
    },
    onSuccess: (data: { questions: Array<{ question: string; methodology: string; stage: string; outcome: string; followUp: string }> }) => {
      setSuggestedTensionQuestions(data.questions.map((q, i) => ({
        id: `ai-${Date.now()}-${i}`,
        question: q.question,
        methodology: q.methodology as "SPIN" | "MILLER_HEIMAN" | "PSS",
        stage: q.stage,
        outcome: q.outcome,
        followUp: q.followUp,
        selected: false
      })));
      setTensionQuestionsLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate questions",
        description: error.message || "Could not generate questions. Please try again.",
        variant: "destructive"
      });
      setTensionQuestionsLoading(false);
    }
  });
  
  const handleGenerateTensionQuestions = () => {
    setTensionQuestionsLoading(true);
    setSuggestedTensionQuestions([]);
    generateTensionQuestionsMutation.mutate();
  };
  
  const handleAddCustomQuestion = () => {
    if (!customQuestionText.trim()) return;
    setSuggestedTensionQuestions(prev => [...prev, {
      id: `custom-${Date.now()}`,
      question: customQuestionText.trim(),
      methodology: "PSS" as const, // Default to PSS for custom
      stage: "Custom",
      outcome: "",
      followUp: "",
      selected: true
    }]);
    setCustomQuestionText("");
  };
  
  const handleAddSelectedQuestions = () => {
    const selected = suggestedTensionQuestions.filter(q => q.selected);
    const newQuestions: TensionQuestion[] = selected.map((q, i) => ({
      id: crypto.randomUUID(),
      prompt: q.question,
      methodology: q.methodology === "MILLER_HEIMAN" ? "MILLER_HEIMAN" as const : 
                   q.methodology === "SPIN" ? "SPIN" as const : 
                   q.methodology === "PSS" ? "PSS" as const : "CUSTOM" as const,
      rationale: q.outcome ? `Uncovers: ${q.outcome}. Follow-up: ${q.followUp}` : undefined,
      source: q.id.startsWith("custom") ? "manual" as const : "ai" as const,
      response: "",
      order: storyBuilderData.before.tensionQuestions.length + i
    }));
    
    setStoryBuilderData(prev => ({
      ...prev,
      before: {
        ...prev.before,
        tensionQuestions: [...prev.before.tensionQuestions, ...newQuestions]
      }
    }));
    
    setTensionQuestionsDialogOpen(false);
    setSuggestedTensionQuestions([]);
    toast({
      title: `Added ${newQuestions.length} question${newQuestions.length > 1 ? 's' : ''}`,
      description: "Questions are now ready for you to use during your conversation."
    });
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
  
  // Initialize story builder from project data
  useEffect(() => {
    if (project && !storyBuilderInitialized) {
      const savedData = (project as any).storyBuilderData;
      if (savedData) {
        // Migrate legacy tensionQuestion string to new array structure
        let tensionQuestions: TensionQuestion[] = savedData.before?.tensionQuestions || [];
        if (tensionQuestions.length === 0 && savedData.before?.tensionQuestion) {
          // Migrate legacy string to array
          tensionQuestions = [{
            id: crypto.randomUUID(),
            prompt: savedData.before.tensionQuestion,
            methodology: "CUSTOM" as const,
            source: "manual" as const,
            response: "",
            order: 0
          }];
        }
        
        const initialData = {
          before: {
            singleMessage: savedData.before?.singleMessage || "",
            emotionalReaction: savedData.before?.emotionalReaction || "",
            storyStructure: savedData.before?.storyStructure || "situation-struggle-insight-outcome",
            startingHook: savedData.before?.startingHook || "",
            heroCharacter: savedData.before?.heroCharacter || "",
            evidenceToReference: savedData.before?.evidenceToReference || "",
            tensionQuestions
          },
          during: {
            openingLine: savedData.during?.openingLine || "",
            turningPoint: savedData.during?.turningPoint || "",
            keyDataPoints: savedData.during?.keyDataPoints || "",
            pausePoints: savedData.during?.pausePoints || [],
            pacingNotes: savedData.during?.pacingNotes || ""
          },
          after: {
            momentOfMeaning: savedData.after?.momentOfMeaning || "",
            explicitTakeaway: savedData.after?.explicitTakeaway || "",
            callToAction: savedData.after?.callToAction || ""
          },
          storyTest: {
            strangerCareScore: savedData.storyTest?.strangerCareScore ?? null,
            simplicityScore: savedData.storyTest?.simplicityScore ?? null,
            leadershipValuesScore: savedData.storyTest?.leadershipValuesScore ?? null,
            testNotes: savedData.storyTest?.testNotes || ""
          }
        };
        lastSavedStoryBuilderDataRef.current = JSON.stringify(initialData);
        setStoryBuilderData(initialData);
        if (savedData.lastUpdated) {
          setStoryBuilderLastSaved(`Last saved ${new Date(savedData.lastUpdated).toLocaleTimeString()}`);
        }
      }
      setStoryBuilderInitialized(true);
    }
  }, [project, storyBuilderInitialized]);
  
  // Legacy narrative canvas auto-save - DISABLED (replaced by Story Coach)
  // Story Coach uses storyBuilderData which auto-saves via saveStoryBuilderMutation
  
  // Initialize Green Sheet data from project
  useEffect(() => {
    if (project && !greenSheetInitialized) {
      const savedGreenSheet = (project as any).greenSheetData;
      let loadedMeetingContact = {
        name: "",
        title: "",
        role: null as ("economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion" | null),
        influence: null as ("high" | "medium" | "low" | null),
        knownConcerns: "",
        personalRapport: "",
        decisionCriteria: ""
      };
      let loadedCallPlanner = {
        objective: "",
        desiredOutcome: "",
        openingStatement: "",
        bestActionCommitment: ""
      };
      
      if (savedGreenSheet) {
        if (savedGreenSheet.meetingContact) {
          loadedMeetingContact = {
            name: savedGreenSheet.meetingContact.name || "",
            title: savedGreenSheet.meetingContact.title || "",
            role: savedGreenSheet.meetingContact.role || null,
            influence: savedGreenSheet.meetingContact.influence || null,
            knownConcerns: savedGreenSheet.meetingContact.knownConcerns || "",
            personalRapport: savedGreenSheet.meetingContact.personalRapport || "",
            decisionCriteria: savedGreenSheet.meetingContact.decisionCriteria || ""
          };
        }
        if (savedGreenSheet.callPlanner) {
          loadedCallPlanner = {
            objective: savedGreenSheet.callPlanner.objective || "",
            desiredOutcome: savedGreenSheet.callPlanner.desiredOutcome || "",
            openingStatement: savedGreenSheet.callPlanner.openingStatement || "",
            bestActionCommitment: savedGreenSheet.callPlanner.bestActionCommitment || ""
          };
        }
        if (savedGreenSheet.lastUpdated) {
          setLastSavedGreenSheet(new Date(savedGreenSheet.lastUpdated).toLocaleTimeString());
        }
      }
      
      // Set state and update ref to match loaded data (prevents triggering save on init)
      setMeetingContact(loadedMeetingContact);
      setGreenSheetEdits(loadedCallPlanner);
      lastSavedGreenSheetDataRef.current = JSON.stringify({ meetingContact: loadedMeetingContact, callPlanner: loadedCallPlanner });
      setGreenSheetInitialized(true);
    }
  }, [project, greenSheetInitialized]);

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

  // Outcome Recommendation Type (from AI)
  type OutcomeRecommendation = {
    id: string;
    outcomeName: string;
    outcomeDescription: string;
    why: {
      strategicRationale: string;
      discoveryEvidence: string[];
      businessImpact: string;
    };
    how: {
      approach: string;
      kornFerrySolution: string;
      timeframe: string;
      keyActivities: string[];
    };
    benchmark: {
      industryLow: string;
      industryMedian: string;
      industryHigh: string;
      topPerformerTarget: string;
      source: string;
    };
    kpiDetails: {
      metricName: string;
      unit: string;
      suggestedBaseline: string;
      suggestedTarget: string;
      targetTimeframe: string;
    };
    valuePillar: "grow" | "optimise" | "derisk" | "strengthen";
    priority: "high" | "medium" | "low";
    estimatedAnnualValue: string;
    confidenceScore: number;
  };

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
    
    // AI Outcome Recommendations state
    const [outcomeRecommendations, setOutcomeRecommendations] = useState<OutcomeRecommendation[]>([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsInitialLoading, setRecommendationsInitialLoading] = useState(true);
    const [recommendationsSummary, setRecommendationsSummary] = useState<string>("");
    const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
    const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
    const [editingRecommendation, setEditingRecommendation] = useState<OutcomeRecommendation | null>(null);
    const [editedValues, setEditedValues] = useState<{baseline: string; target: string; targetDate: string}>({baseline: "", target: "", targetDate: ""});
    const [creatingFromRecommendations, setCreatingFromRecommendations] = useState(false);
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

    // Revert outcome to draft status
    const revertToDraftMutation = useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("PATCH", `/api/projects/${projectId}/commitments/${id}`, {
          status: "draft",
          clientConfirmedAt: null
        });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        toast({ title: "Reverted to Draft", description: "Outcome has been moved back to drafts for editing." });
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

    const getSolutionPatternBadge = (pattern: string | null) => {
      if (!pattern) return null;
      const patternData = SOLUTION_VALUE_PATTERNS[pattern as SolutionPatternId];
      if (!patternData) return null;
      
      return (
        <Badge variant="outline" className="text-xs border-dashed">
          {patternData.name}
        </Badge>
      );
    };

    const getJourneyData = (commitment: any) => {
      const storedPhases = commitment?.journeyPhases;
      const storedQuickWins = commitment?.quickWins;
      const storedMilestones = commitment?.keyMilestones;
      
      const hasStoredPhases = storedPhases && 
        Array.isArray(storedPhases) && 
        storedPhases.length > 0 &&
        storedPhases[0]?.phase;
      
      const hasStoredQuickWins = storedQuickWins && 
        Array.isArray(storedQuickWins) && 
        storedQuickWins.length > 0;
      
      const hasStoredMilestones = storedMilestones && 
        Array.isArray(storedMilestones) && 
        storedMilestones.length > 0;
      
      if (hasStoredPhases) {
        return {
          phases: storedPhases,
          quickWins: hasStoredQuickWins ? storedQuickWins : [],
          milestones: hasStoredMilestones ? storedMilestones : [],
          typicalTimeline: commitment.implementationTimeline || "TBD",
          description: commitment.description || "",
          focusAreas: [],
        };
      }
      
      if (!commitment?.solutionPattern) return null;
      return OUTCOME_JOURNEY_TEMPLATES[commitment.solutionPattern as SolutionPatternId] || null;
    };
    
    const getJourneyTemplate = (solutionPattern: string | null) => {
      if (!solutionPattern) return null;
      return OUTCOME_JOURNEY_TEMPLATES[solutionPattern as SolutionPatternId] || null;
    };

    // Journey panel state for each commitment
    const [expandedJourneys, setExpandedJourneys] = useState<Set<number>>(new Set());
    const [viewingJourneyId, setViewingJourneyId] = useState<number | null>(null);
    
    // Selection state for unified journey timeline
    const [timelineSelectedOutcomes, setTimelineSelectedOutcomes] = useState<Set<string>>(new Set());

    const toggleJourneyExpanded = (id: number) => {
      setExpandedJourneys(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    const draftCommitments = (commitments as any[]).filter(c => c.status === "draft");
    const proposedCommitments = (commitments as any[]).filter(c => c.status === "proposed");
    const confirmedCommitments = (commitments as any[]).filter(c => c.status === "client_confirmed" || c.status === "handed_off");
    const inDeliveryCommitments = (commitments as any[]).filter(c => c.status === "in_delivery" || c.status === "completed");
    const totalCommittedValue = (commitments as any[]).reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
    const confirmedValue = confirmedCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
    const proposedValue = proposedCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
    const draftValue = draftCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);

    // Generate AI outcome recommendations from discovery synthesis
    const generateRecommendations = async () => {
      if (recommendationsLoading) return;
      setRecommendationsLoading(true);
      
      try {
        const response = await apiRequest("POST", `/api/projects/${projectId}/outcome-recommendations`, {});
        const data = await response.json();
        
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setOutcomeRecommendations(data.recommendations);
          setRecommendationsSummary(data.summary || "");
          toast({
            title: "Recommendations Ready",
            description: `Generated ${data.recommendations.length} outcome recommendations based on discovery insights`
          });
        }
      } catch (error: any) {
        console.error("Failed to generate recommendations:", error);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.message || "Could not generate recommendations. Make sure discovery insights are available."
        });
      } finally {
        setRecommendationsLoading(false);
      }
    };

    // Fetch cached recommendations on mount
    useEffect(() => {
      const fetchCachedRecommendations = async () => {
        setRecommendationsInitialLoading(true);
        try {
          const response = await fetch(`/api/projects/${projectId}/outcome-recommendations`);
          if (response.ok) {
            const data = await response.json();
            if (data.recommendations) {
              setOutcomeRecommendations(data.recommendations);
              setRecommendationsSummary(data.summary || "");
            }
          }
        } catch (error) {
          // Silently fail - recommendations not cached yet
        } finally {
          setRecommendationsInitialLoading(false);
        }
      };
      fetchCachedRecommendations();
    }, [projectId]);

    // Toggle recommendation selection
    const toggleRecommendationSelection = (id: string) => {
      setSelectedRecommendations(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };

    // Helper to parse numeric value from string (e.g., "$2.5M" -> 2500000)
    const parseValueToNumber = (value: string): number | null => {
      if (!value) return null;
      const cleanedValue = value.replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleanedValue);
      if (isNaN(num)) return null;
      // Handle if value contains M for millions
      if (value.toLowerCase().includes('m')) {
        return Math.round(num * 1000000);
      }
      // Handle if value contains K for thousands
      if (value.toLowerCase().includes('k')) {
        return Math.round(num * 1000);
      }
      return Math.round(num);
    };

    // Create commitments from selected recommendations
    const createCommitmentsFromRecommendations = async () => {
      if (selectedRecommendations.size === 0 || creatingFromRecommendations) return;
      
      setCreatingFromRecommendations(true);
      const selectedRecs = outcomeRecommendations.filter(r => selectedRecommendations.has(r.id));
      let successCount = 0;
      
      try {
        for (const rec of selectedRecs) {
          try {
            await createCommitmentMutation.mutateAsync({
              commitmentTitle: rec.outcomeName,
              commitmentDescription: rec.outcomeDescription,
              customMetricName: rec.kpiDetails.metricName,
              metricUnit: rec.kpiDetails.unit,
              baselineValue: rec.kpiDetails.suggestedBaseline,
              targetValue: rec.kpiDetails.suggestedTarget,
              targetDate: null,
              estimatedAnnualValue: parseValueToNumber(rec.estimatedAnnualValue),
              valuePillar: rec.valuePillar,
              strategyAlignmentRationale: rec.why.strategicRationale,
              provenance: {
                source: "ai_generated",
                sourceInsightTitle: rec.why.discoveryEvidence[0] || "Discovery Synthesis",
                recommendationId: rec.id,
                generatedAt: new Date().toISOString(),
              }
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to create commitment from ${rec.outcomeName}:`, error);
          }
        }
        
        setSelectedRecommendations(new Set());
        if (successCount > 0) {
          toast({
            title: "Outcomes Created",
            description: `Created ${successCount} outcome${successCount > 1 ? 's' : ''} from recommendations. Review and submit for client approval.`
          });
        }
      } finally {
        setCreatingFromRecommendations(false);
      }
    };

    // Start editing a recommendation (to complete baseline before adding)
    const startEditingRecommendation = (rec: OutcomeRecommendation) => {
      setEditingRecommendation(rec);
      setEditedValues({
        baseline: rec.kpiDetails.suggestedBaseline,
        target: rec.kpiDetails.suggestedTarget,
        targetDate: ""
      });
    };

    // Create single commitment from edited recommendation
    const createCommitmentFromEditedRecommendation = async () => {
      if (!editingRecommendation) return;
      
      try {
        await createCommitmentMutation.mutateAsync({
          commitmentTitle: editingRecommendation.outcomeName,
          commitmentDescription: editingRecommendation.outcomeDescription,
          customMetricName: editingRecommendation.kpiDetails.metricName,
          metricUnit: editingRecommendation.kpiDetails.unit,
          baselineValue: editedValues.baseline,
          targetValue: editedValues.target,
          targetDate: editedValues.targetDate ? new Date(editedValues.targetDate).toISOString() : null,
          estimatedAnnualValue: parseValueToNumber(editingRecommendation.estimatedAnnualValue),
          valuePillar: editingRecommendation.valuePillar,
          strategyAlignmentRationale: editingRecommendation.why.strategicRationale,
          provenance: {
            source: "ai_generated",
            sourceInsightTitle: editingRecommendation.why.discoveryEvidence[0] || "Discovery Synthesis",
            recommendationId: editingRecommendation.id,
            generatedAt: new Date().toISOString(),
          }
        });
        
        setEditingRecommendation(null);
        setEditedValues({baseline: "", target: "", targetDate: ""});
      } catch (error) {
        console.error("Failed to create commitment:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create outcome. Please try again."
        });
      }
    };

    // Value pillar display helpers
    const getRecommendationPillarBadge = (pillar: string) => {
      const pillarConfig: Record<string, { name: string; color: string }> = {
        grow: { name: "Grow", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
        optimise: { name: "Optimise", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
        derisk: { name: "De-risk", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
        strengthen: { name: "Strengthen", color: "bg-violet-500/10 text-violet-600 border-violet-500/30" }
      };
      const config = pillarConfig[pillar] || pillarConfig.grow;
      return <Badge className={`${config.color} border text-xs`}>{config.name}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
      const priorityConfig: Record<string, { color: string }> = {
        high: { color: "bg-red-500/10 text-red-600" },
        medium: { color: "bg-amber-500/10 text-amber-600" },
        low: { color: "bg-slate-500/10 text-slate-600" }
      };
      const config = priorityConfig[priority] || priorityConfig.medium;
      return <Badge className={`${config.color} text-xs`}>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</Badge>;
    };

    return (
      <div className="space-y-6">
        {/* Strategic Alignment - AI-Generated Organizational Strategies */}
        <StrategicAlignmentSelector
          projectId={projectId}
          companyName={project?.companyName}
          industry={project?.sector || undefined}
          onStrategiesSelected={(strategies) => {
            console.log("Selected Strategies:", strategies);
          }}
          onComplete={async (data) => {
            console.log("Strategic alignment complete:", data);
            
            const kornFerrySolutionToPattern: Record<string, string> = {
              "Leadership Development": "leadership_development",
              "Leadership Assessment": "leadership_development",
              "Executive Assessment": "leadership_development",
              "Sales Effectiveness": "sales_effectiveness",
              "Sales Training": "sales_effectiveness",
              "Sales Force Transformation": "sales_effectiveness",
              "Talent Acquisition": "talent_acquisition",
              "Recruiting Strategy": "talent_acquisition",
              "Assessment & Selection": "talent_acquisition",
              "Compensation & Benefits": "rewards_optimization",
              "Total Rewards": "rewards_optimization",
              "Pay & Benefits": "rewards_optimization",
              "Organization Design": "org_transformation",
              "Organization Transformation": "org_transformation",
              "Change Management": "org_transformation",
              "Workforce Planning": "org_transformation",
              "Strategic Workforce Planning": "org_transformation",
              "Succession Planning": "leadership_development",
              "Succession Management": "leadership_development",
              "Employee Engagement": "org_transformation",
              "Culture Transformation": "org_transformation",
              "Culture & Engagement": "org_transformation",
              "Diversity & Inclusion": "org_transformation",
              "DEI": "org_transformation",
              "DEI Transformation": "org_transformation",
            };
            
            let successCount = 0;
            for (const outcome of data.outcomes) {
              try {
                const baselineStr = outcome.kpiDetails?.suggestedBaseline || "";
                const targetStr = outcome.kpiDetails?.suggestedTarget || "";
                
                const solutionPattern = kornFerrySolutionToPattern[outcome.kornFerrySolution] || null;
                
                await createCommitmentMutation.mutateAsync({
                  commitmentTitle: outcome.outcomeName,
                  commitmentDescription: outcome.outcomeDescription,
                  metricUnit: outcome.kpiDetails?.unit || "",
                  baselineValue: baselineStr,
                  targetValue: targetStr,
                  valuePillar: outcome.valuePillar,
                  solutionPattern,
                  status: "draft",
                  outcomeStatement: outcome.businessImpact,
                  provenance: {
                    source: "strategic_alignment",
                    strategyId: outcome.strategyId,
                    kornFerrySolution: outcome.kornFerrySolution,
                    kfOffering: (outcome as any).kfOffering,
                    kfRecommendation: (outcome as any).kfRecommendation,
                    whyMatters: (outcome as any).whyMatters,
                    howKFHelps: (outcome as any).howKFHelps,
                    benchmark: outcome.benchmark,
                    generatedAt: new Date().toISOString(),
                  },
                });
                successCount++;
              } catch (error) {
                console.error("Failed to create commitment from outcome:", error);
              }
            }
            
            queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
            
            toast({
              title: "Outcomes Created",
              description: `${successCount} outcome${successCount !== 1 ? 's' : ''} created from ${data.strategies.length} strategic priorities.`
            });
          }}
        />

        {/* Edit Recommendation Dialog */}
        <Dialog open={!!editingRecommendation} onOpenChange={(open) => !open && setEditingRecommendation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Complete Outcome Details</DialogTitle>
              <DialogDescription>
                Review and adjust the baseline and target values before adding this outcome
              </DialogDescription>
            </DialogHeader>
            {editingRecommendation && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{editingRecommendation.outcomeName}</h4>
                  <p className="text-sm text-muted-foreground">{editingRecommendation.outcomeDescription}</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-baseline">Baseline Value ({editingRecommendation.kpiDetails.unit})</Label>
                    <Input 
                      id="edit-baseline"
                      value={editedValues.baseline}
                      onChange={(e) => setEditedValues(prev => ({...prev, baseline: e.target.value}))}
                      placeholder={editingRecommendation.kpiDetails.suggestedBaseline}
                      data-testid="input-edit-baseline"
                    />
                    <p className="text-xs text-muted-foreground">
                      Suggested: {editingRecommendation.kpiDetails.suggestedBaseline}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-target">Target Value ({editingRecommendation.kpiDetails.unit})</Label>
                    <Input 
                      id="edit-target"
                      value={editedValues.target}
                      onChange={(e) => setEditedValues(prev => ({...prev, target: e.target.value}))}
                      placeholder={editingRecommendation.kpiDetails.suggestedTarget}
                      data-testid="input-edit-target"
                    />
                    <p className="text-xs text-muted-foreground">
                      Top performer target: {editingRecommendation.benchmark.topPerformerTarget}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-target-date">Target Date</Label>
                  <Input 
                    id="edit-target-date"
                    type="date"
                    value={editedValues.targetDate}
                    onChange={(e) => setEditedValues(prev => ({...prev, targetDate: e.target.value}))}
                    data-testid="input-edit-target-date"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended timeframe: {editingRecommendation.how.timeframe}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-1">Estimated Annual Value</p>
                  <p className="text-lg font-bold text-primary">{editingRecommendation.estimatedAnnualValue}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRecommendation(null)}>
                Cancel
              </Button>
              <Button 
                onClick={createCommitmentFromEditedRecommendation}
                disabled={createCommitmentMutation.isPending}
                data-testid="button-save-edited-recommendation"
              >
                {createCommitmentMutation.isPending ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Add Outcome
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Outcome Pipeline - Narrative Story Format */}
        <div className="space-y-6" data-demo-step="kpi-pipeline">
          {/* Header Section - Total Value & Pipeline Progress */}
          <Card className="bg-gradient-to-r from-primary/5 via-emerald-500/5 to-violet-500/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Total Outcome Value */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Outcome Value</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      ${((confirmedValue + proposedValue + draftValue) / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {confirmedCommitments.length + proposedCommitments.length + draftCommitments.length} outcomes defined
                    </p>
                  </div>
                </div>

                {/* Pipeline Status Counts */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{draftCommitments.length}</p>
                      <p className="text-xs text-muted-foreground">Draft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-blue-500/20">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{proposedCommitments.length}</p>
                      <p className="text-xs text-muted-foreground">In Review</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{confirmedCommitments.length}</p>
                      <p className="text-xs text-muted-foreground">Confirmed</p>
                    </div>
                  </div>
                </div>

                {/* Pipeline Progress Bar */}
                <div className="lg:w-64">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Pipeline Progress</span>
                    <span>{confirmedCommitments.length + proposedCommitments.length + draftCommitments.length > 0 
                      ? Math.round((confirmedCommitments.length / (confirmedCommitments.length + proposedCommitments.length + draftCommitments.length)) * 100)
                      : 0}% confirmed</span>
                  </div>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                    {confirmedCommitments.length > 0 && (
                      <div 
                        className="bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(confirmedCommitments.length / (confirmedCommitments.length + proposedCommitments.length + draftCommitments.length)) * 100}%` }}
                      />
                    )}
                    {proposedCommitments.length > 0 && (
                      <div 
                        className="bg-blue-500 transition-all duration-500"
                        style={{ width: `${(proposedCommitments.length / (confirmedCommitments.length + proposedCommitments.length + draftCommitments.length)) * 100}%` }}
                      />
                    )}
                    {draftCommitments.length > 0 && (
                      <div 
                        className="bg-muted-foreground/30 transition-all duration-500"
                        style={{ width: `${(draftCommitments.length / (confirmedCommitments.length + proposedCommitments.length + draftCommitments.length)) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmed</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Review</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Draft</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables Journey Timeline - Combined Sales to Delivery View */}
          {(commitments as any[]).length > 0 && (
            <Card data-testid="deliverables-journey-timeline">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Deliverables Journey</CardTitle>
                      <CardDescription className="mt-1">
                        Combined Sales to Delivery timeline for all outcomes
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="text-center px-2">
                      <p className="text-xl font-bold">{(commitments as any[]).length}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center px-2">
                      <p className="text-xl font-bold text-emerald-600">${((confirmedValue + proposedValue + draftValue) / 1000000).toFixed(2)}M</p>
                      <p className="text-xs text-muted-foreground">Value</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Journey Phase Headers */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium mb-2">
                  <div className="text-muted-foreground">Outcome</div>
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <Zap className="w-3 h-3" />
                    <span>Near Term</span>
                    <span className="text-muted-foreground">(0-3mo)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-violet-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>Build Momentum</span>
                    <span className="text-muted-foreground">(3-9mo)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-emerald-600">
                    <Trophy className="w-3 h-3" />
                    <span>Realize Value</span>
                    <span className="text-muted-foreground">(9-18mo)</span>
                  </div>
                </div>
                
                {/* Deliverables Rows */}
                <div className="space-y-2">
                  {(commitments as any[]).map((c: any) => {
                    const status = c.status || 'draft';
                    const journeyTemplate = OUTCOME_JOURNEY_TEMPLATES[c.solutionPattern as SolutionPatternId];
                    const timeline = journeyTemplate?.typicalTimeline || "";
                    
                    let monthOrder: number;
                    if (timeline) {
                      monthOrder = parseInt(timeline.match(/\d+/)?.[0] || "6");
                    } else {
                      monthOrder = status === 'draft' ? 2 : status === 'proposed' ? 5 : 10;
                    }
                    
                    const statusColor = status === 'confirmed' 
                      ? 'bg-emerald-500' 
                      : status === 'proposed' 
                        ? 'bg-blue-500' 
                        : 'bg-muted-foreground/50';
                    
                    const statusBg = status === 'confirmed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : status === 'proposed'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-muted/50 border-muted-foreground/20';
                    
                    const currentPhase = monthOrder <= 3 ? 'near_term' : monthOrder <= 9 ? 'build_momentum' : 'realize_value';
                    const kfOffering = c.provenance?.kfOffering;
                    const sourceStrategy = c.provenance?.kornFerrySolution || c.provenance?.sourceStrategy;
                    
                    return (
                      <div key={c.id} className={`grid grid-cols-4 gap-2 p-3 rounded-lg border ${statusBg}`} data-testid={`deliverable-row-${c.id}`}>
                        {/* Outcome Info */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${statusColor} shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate" title={c.name}>{c.name}</p>
                            <div className="flex items-center gap-1 flex-wrap">
                              {sourceStrategy && (
                                <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px] px-1" title={`Strategy: ${sourceStrategy}`}>
                                  <Target className="w-2.5 h-2.5 mr-0.5" />
                                  {sourceStrategy.length > 20 ? sourceStrategy.substring(0, 20) + '...' : sourceStrategy}
                                </Badge>
                              )}
                              {kfOffering && (
                                <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/30 text-[9px] px-1">
                                  {kfOffering.name}
                                </Badge>
                              )}
                              {getValuePillarBadge(c.valuePillar)}
                              {c.estimatedAnnualValue && (
                                <span className="text-[10px] text-muted-foreground">${(c.estimatedAnnualValue / 1000).toFixed(0)}K</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Near Term Phase */}
                        <div className="flex items-center justify-center">
                          {currentPhase === 'near_term' ? (
                            <div className="w-full h-2 rounded-full bg-blue-500 relative">
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            </div>
                          ) : (
                            <div className={`w-full h-2 rounded-full ${monthOrder > 3 ? 'bg-blue-500/30' : 'bg-muted'}`} />
                          )}
                        </div>
                        
                        {/* Build Momentum Phase */}
                        <div className="flex items-center justify-center">
                          {currentPhase === 'build_momentum' ? (
                            <div className="w-full h-2 rounded-full bg-violet-500 relative">
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 border-2 border-background flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            </div>
                          ) : (
                            <div className={`w-full h-2 rounded-full ${monthOrder > 9 ? 'bg-violet-500/30' : currentPhase === 'near_term' ? 'bg-muted' : 'bg-muted'}`} />
                          )}
                        </div>
                        
                        {/* Realize Value Phase */}
                        <div className="flex items-center justify-center">
                          {currentPhase === 'realize_value' ? (
                            <div className="w-full h-2 rounded-full bg-emerald-500 relative">
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-2 rounded-full bg-muted" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Journey Legend */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Confirmed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>In Review</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                    <span>Draft</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3" />
                    <span>Sales → Delivery Journey</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Value Story Section - Confirmed Outcomes Grouped by Pillar */}
          {confirmedCommitments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                    <CardTitle className="text-lg">Our Value Story</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    ${(confirmedValue / 1000000).toFixed(2)}M confirmed value
                  </Badge>
                </div>
                <CardDescription>
                  Client-confirmed outcomes organized by value pillar - telling the story of how we will create value together
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Group confirmed outcomes by pillar */}
                {Object.entries(VALUE_PILLARS).map(([pillarId, pillar]) => {
                  const pillarOutcomes = confirmedCommitments.filter((c: any) => c.valuePillar === pillarId);
                  if (pillarOutcomes.length === 0) return null;
                  
                  const pillarValue = pillarOutcomes.reduce((sum: number, c: any) => sum + (c.estimatedAnnualValue || 0), 0);
                  
                  const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                    emerald: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-600", icon: "bg-emerald-500/10" },
                    blue: { bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-600", icon: "bg-blue-500/10" },
                    amber: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-600", icon: "bg-amber-500/10" },
                    violet: { bg: "bg-violet-500/5", border: "border-violet-500/20", text: "text-violet-600", icon: "bg-violet-500/10" },
                  };
                  const colors = colorMap[pillar.color] || colorMap.emerald;
                  
                  const pillarIcon: Record<string, JSX.Element> = {
                    grow: <TrendingUp className="w-5 h-5" />,
                    optimise: <BarChart3 className="w-5 h-5" />,
                    derisk: <Shield className="w-5 h-5" />,
                    strengthen: <Users className="w-5 h-5" />,
                  };
                  
                  return (
                    <div key={pillarId} className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${colors.icon} ${colors.text} flex items-center justify-center`}>
                            {pillarIcon[pillarId]}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${colors.text}`}>We will {pillar.name.toUpperCase()}</h3>
                            <p className="text-xs text-muted-foreground">{pillar.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${colors.text}`}>
                            ${(pillarValue / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-muted-foreground">{pillarOutcomes.length} outcome{pillarOutcomes.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {pillarOutcomes.map((c: any) => {
                          const journeyTemplate = getJourneyData(c);
                          const kfOffering = c.provenance?.kfOffering;
                          const kfRecommendation = c.provenance?.kfRecommendation;
                          const whyMatters = c.provenance?.whyMatters;
                          const howKFHelps = c.provenance?.howKFHelps;
                          const benchmark = c.provenance?.benchmark;
                          
                          return (
                            <Collapsible key={c.id}>
                              <div 
                                className="p-3 rounded-lg bg-background border hover-elevate"
                                data-testid={`commitment-confirmed-${c.id}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <Badge variant="outline" className={`text-[10px] px-1.5 shrink-0 ${colors.icon} ${colors.border}`}>
                                        #{c.id}
                                      </Badge>
                                      <h4 className="font-medium text-sm">{c.name}</h4>
                                      {kfOffering && (
                                        <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/30 text-[10px] px-1.5 shrink-0">
                                          <Briefcase className="w-3 h-3 mr-1" />
                                          {kfOffering.name}
                                        </Badge>
                                      )}
                                      {(c.provenance?.source === "ai_generated" || c.provenance?.source === "strategic_alignment") && (
                                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] px-1.5 shrink-0">
                                          <Sparkles className="w-3 h-3" />
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center flex-wrap gap-3 text-xs mb-2">
                                      {c.baselineValue !== null && c.targetValue !== null && (
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <Target className="w-3 h-3" />
                                          {c.baselineValue} → {c.targetValue} {c.kpiUnit || ""}
                                        </span>
                                      )}
                                      {c.estimatedAnnualValue && (
                                        <span className={`font-medium ${colors.text}`}>
                                          ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                                        </span>
                                      )}
                                      {journeyTemplate && (
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <Layers className="w-3 h-3" />
                                          {journeyTemplate.phases.length} phases
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* KF Recommendation - Always visible */}
                                    {kfRecommendation && (
                                      <div className="text-xs p-2 rounded bg-violet-500/5 border border-violet-500/20 mb-2">
                                        <span className="font-medium text-violet-600">KF Recommendation:</span>{" "}
                                        <span className="text-muted-foreground">{kfRecommendation}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 shrink-0">
                                    {getHealthStatusBadge(c.healthStatus)}
                                    {(whyMatters || howKFHelps || benchmark) && (
                                      <CollapsibleTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7"
                                          title="View KF details"
                                        >
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </Button>
                                      </CollapsibleTrigger>
                                    )}
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={(e) => { e.stopPropagation(); setViewingJourneyId(c.id); }}
                                      title="View journey"
                                      data-testid={`button-view-journey-${c.id}`}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={(e) => { e.stopPropagation(); setEditingCommitment(c); }}
                                      title="Edit outcome"
                                      data-testid={`button-edit-confirmed-${c.id}`}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={(e) => { e.stopPropagation(); revertToDraftMutation.mutate(c.id); }}
                                      disabled={revertToDraftMutation.isPending}
                                      title="Revert to draft"
                                      data-testid={`button-revert-confirmed-${c.id}`}
                                    >
                                      <Undo2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={(e) => { e.stopPropagation(); deleteCommitmentMutation.mutate(c.id); }}
                                      title="Delete outcome"
                                      data-testid={`button-delete-confirmed-${c.id}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Collapsible KF Details */}
                                <CollapsibleContent>
                                  <div className="mt-3 pt-3 border-t space-y-3">
                                    {/* Why It Matters */}
                                    {whyMatters && (
                                      <div className="text-xs">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                          <span className="font-medium text-amber-600">Why It Matters</span>
                                        </div>
                                        <p className="text-muted-foreground pl-5">{whyMatters}</p>
                                      </div>
                                    )}
                                    
                                    {/* How KF Helps */}
                                    {howKFHelps && howKFHelps.length > 0 && (
                                      <div className="text-xs">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Briefcase className="w-3.5 h-3.5 text-violet-500" />
                                          <span className="font-medium text-violet-600">How Korn Ferry Helps</span>
                                        </div>
                                        <ul className="text-muted-foreground pl-5 space-y-1">
                                          {howKFHelps.map((item: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-1.5">
                                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Benchmark Data */}
                                    {benchmark && (
                                      <div className="text-xs">
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                                          <span className="font-medium text-blue-600">Industry Benchmarks</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 pl-5">
                                          <div className="p-2 rounded bg-red-500/5 border border-red-500/20 text-center">
                                            <p className="text-[10px] text-red-600 font-medium">Low</p>
                                            <p className="font-medium">{benchmark.industryLow}</p>
                                          </div>
                                          <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20 text-center">
                                            <p className="text-[10px] text-amber-600 font-medium">Median</p>
                                            <p className="font-medium">{benchmark.industryMedian}</p>
                                          </div>
                                          <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-center">
                                            <p className="text-[10px] text-emerald-600 font-medium">High</p>
                                            <p className="font-medium">{benchmark.industryHigh}</p>
                                          </div>
                                          <div className="p-2 rounded bg-violet-500/5 border border-violet-500/20 text-center">
                                            <p className="text-[10px] text-violet-600 font-medium">Top Performer</p>
                                            <p className="font-medium">{benchmark.topPerformerTarget || "Top quartile"}</p>
                                          </div>
                                        </div>
                                        {benchmark.source && (
                                          <p className="text-[10px] text-muted-foreground mt-1 pl-5 italic">Source: {benchmark.source}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {/* Empty state if no confirmed by any pillar */}
                {confirmedCommitments.every((c: any) => !c.valuePillar) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Confirmed outcomes will be organized by value pillar here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Outcomes in Progress - Full-width cards with journey loops */}
          <Card>
            <Collapsible defaultOpen={true}>
              <CardHeader className="pb-3">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">Outcomes in Progress</CardTitle>
                      <Badge variant="secondary">{draftCommitments.length + proposedCommitments.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:bg-muted">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CardDescription>
                  Draft and pending outcomes - refine details before client alignment and handoff
                </CardDescription>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  {/* Combined list of all outcomes in progress with rich details */}
                  {[...draftCommitments, ...proposedCommitments].length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No outcomes in progress</p>
                      <p className="text-xs mt-1">Use Strategy Selection above to generate AI-powered outcomes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...draftCommitments, ...proposedCommitments].map((c: any) => {
                        const journeyTemplate = getJourneyData(c);
                        const kfOffering = c.provenance?.kfOffering;
                        const kfSolution = c.provenance?.kornFerrySolution;
                        const kfRecommendation = c.provenance?.kfRecommendation;
                        const whyMatters = c.provenance?.whyMatters;
                        const howKFHelps = c.provenance?.howKFHelps;
                        const benchmark = c.provenance?.benchmark;
                        const isDraft = c.status === 'draft';
                        
                        const hasAIContext = whyMatters || howKFHelps;
                        const hasBenchmark = benchmark && (benchmark.industryMedian || benchmark.industryHigh);
                        const hasJourneyData = journeyTemplate && Array.isArray(journeyTemplate.phases) && journeyTemplate.phases.length > 0;
                        const hasExpandableContent = hasAIContext || hasBenchmark || hasJourneyData;
                        
                        return (
                          <Collapsible key={c.id} defaultOpen={false}>
                            <div 
                              className={`rounded-lg border transition-all ${
                                isDraft 
                                  ? 'border-muted hover-elevate' 
                                  : 'border-blue-500/30 bg-blue-500/5'
                              }`}
                              data-testid={`outcome-progress-${c.id}`}
                            >
                              {/* Header Row - Always visible */}
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 shrink-0 ${
                                          isDraft ? 'bg-muted' : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                                        }`}
                                      >
                                        {isDraft ? 'Draft' : 'Pending Review'}
                                      </Badge>
                                      {(c.provenance?.source === "ai_generated" || c.provenance?.source === "strategic_alignment") && (
                                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] px-1.5">
                                          <Sparkles className="w-3 h-3 mr-0.5" />
                                          AI Generated
                                        </Badge>
                                      )}
                                      {getValuePillarBadge(c.valuePillar)}
                                    </div>
                                    <h4 className="font-semibold text-base">{c.name}</h4>
                                    {c.outcomeStatement && (
                                      <p className="text-sm text-muted-foreground mt-1">{c.outcomeStatement}</p>
                                    )}
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {isDraft ? (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => setEditingCommitment(c)}
                                          data-testid={`button-edit-outcome-${c.id}`}
                                        >
                                          <Pencil className="w-3.5 h-3.5 mr-1" />
                                          Edit
                                        </Button>
                                        <Button 
                                          size="sm"
                                          onClick={() => submitForReviewMutation.mutate(c.id)}
                                          disabled={submitForReviewMutation.isPending}
                                          data-testid={`button-submit-outcome-${c.id}`}
                                        >
                                          <Send className="w-3.5 h-3.5 mr-1" />
                                          Submit for Review
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => revertToDraftMutation.mutate(c.id)}
                                          disabled={revertToDraftMutation.isPending}
                                          data-testid={`button-revert-outcome-${c.id}`}
                                        >
                                          <Undo2 className="w-3.5 h-3.5 mr-1" />
                                          Back to Draft
                                        </Button>
                                        <Button 
                                          size="sm"
                                          className="bg-emerald-600 hover:bg-emerald-700"
                                          onClick={() => confirmCommitmentMutation.mutate(c.id)}
                                          disabled={confirmCommitmentMutation.isPending}
                                          data-testid={`button-confirm-outcome-${c.id}`}
                                        >
                                          <Check className="w-3.5 h-3.5 mr-1" />
                                          Confirm
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Key Metrics Row */}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  {/* Baseline → Target */}
                                  {(c.baselineValue || c.targetValue) && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">Baseline:</span>
                                      <span className="font-medium">{c.baselineValue || '—'}</span>
                                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">Target:</span>
                                      <span className="font-medium text-emerald-600">{c.targetValue || '—'}</span>
                                      {c.kpiUnit && <span className="text-muted-foreground">{c.kpiUnit}</span>}
                                    </div>
                                  )}
                                  
                                  {/* Estimated Value */}
                                  {c.estimatedAnnualValue && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-violet-500/10">
                                      <DollarSign className="w-4 h-4 text-violet-600" />
                                      <span className="font-semibold text-violet-600">
                                        ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* KF Solution */}
                                  {(kfSolution || kfOffering?.name) && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10">
                                      <Briefcase className="w-4 h-4 text-primary" />
                                      <span className="text-sm font-medium text-primary">
                                        {kfOffering?.name || kfSolution}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Timeline */}
                                  {journeyTemplate?.typicalTimeline && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10">
                                      <Calendar className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm text-blue-600">{journeyTemplate.typicalTimeline}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Expand button for journey details - only show if there's content */}
                                {hasExpandableContent && (
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="mt-3 w-full justify-between text-muted-foreground">
                                      <span className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        View Delivery Journey & Handoff Details
                                      </span>
                                      <ChevronDown className="w-4 h-4" />
                                    </Button>
                                  </CollapsibleTrigger>
                                )}
                              </div>
                              
                              {/* Expandable Journey Details - only render if there's content */}
                              {hasExpandableContent && <CollapsibleContent>
                                <div className="px-4 pb-4 pt-0 border-t">
                                  <div className="pt-4 space-y-4">
                                    {/* Value Story for Handoff - Only show if AI-generated */}
                                    {(whyMatters || howKFHelps) && (
                                      <div className="grid gap-4 md:grid-cols-2">
                                        {whyMatters && (
                                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Lightbulb className="w-4 h-4 text-amber-600" />
                                              <span className="text-xs font-semibold text-amber-700 uppercase">Why This Matters</span>
                                            </div>
                                            <p className="text-sm">{whyMatters}</p>
                                          </div>
                                        )}
                                        {howKFHelps && (
                                          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Briefcase className="w-4 h-4 text-primary" />
                                              <span className="text-xs font-semibold text-primary uppercase">How Korn Ferry Helps</span>
                                            </div>
                                            <p className="text-sm">{howKFHelps}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Industry Benchmark - Only show if data exists */}
                                    {benchmark && (benchmark.industryMedian || benchmark.industryHigh) && (
                                      <div className="p-3 rounded-lg bg-muted/50 border">
                                        <div className="flex items-center gap-2 mb-2">
                                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-xs font-semibold uppercase text-muted-foreground">Industry Benchmark</span>
                                          {benchmark.source && (
                                            <span className="text-[10px] text-muted-foreground ml-auto">Source: {benchmark.source}</span>
                                          )}
                                        </div>
                                        <div className="flex gap-6 text-sm">
                                          {benchmark.industryLow && (
                                            <div>
                                              <span className="text-muted-foreground">Low: </span>
                                              <span className="font-medium">{benchmark.industryLow}</span>
                                            </div>
                                          )}
                                          {benchmark.industryMedian && (
                                            <div>
                                              <span className="text-muted-foreground">Median: </span>
                                              <span className="font-semibold text-blue-600">{benchmark.industryMedian}</span>
                                            </div>
                                          )}
                                          {benchmark.industryHigh && (
                                            <div>
                                              <span className="text-muted-foreground">High: </span>
                                              <span className="font-medium text-emerald-600">{benchmark.industryHigh}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Journey Loop Visualization - Only show if solution pattern exists */}
                                    {journeyTemplate && journeyTemplate.phases && journeyTemplate.phases.length > 0 && (
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                          <RefreshCw className="w-4 h-4 text-primary" />
                                          <span className="text-sm font-semibold">Delivery Journey Loop</span>
                                          <Badge variant="outline" className="text-xs">
                                            {journeyTemplate.phases.length} phases
                                          </Badge>
                                        </div>
                                        
                                        {/* Interactive Loop Visualizer */}
                                        <JourneyLoopVisualizer
                                          outcomeName={c.name || 'Outcome'}
                                          solutionPattern={c.solutionPattern}
                                          quickWins={journeyTemplate.quickWins || []}
                                          kpis={[]}
                                          isCompact={true}
                                        />
                                        
                                        {/* Quick Wins Preview */}
                                        {Array.isArray(journeyTemplate.quickWins) && journeyTemplate.quickWins.length > 0 && (
                                          <div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <Zap className="w-4 h-4 text-amber-500" />
                                              <span className="text-xs font-semibold uppercase text-amber-600">Quick Wins (Early Value)</span>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-3">
                                              {journeyTemplate.quickWins.slice(0, 3).map((qw: any, idx: number) => (
                                                <div key={idx} className="p-2 rounded-md border bg-amber-500/5 border-amber-500/20">
                                                  <p className="text-xs font-medium">{qw.title || 'Quick Win'}</p>
                                                  <p className="text-[10px] text-muted-foreground">{qw.timeline || ''}</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Key Milestones Preview */}
                                        {Array.isArray(journeyTemplate.milestones) && journeyTemplate.milestones.length > 0 && (
                                          <div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <Flag className="w-4 h-4 text-violet-500" />
                                              <span className="text-xs font-semibold uppercase text-violet-600">Key Milestones for Delivery</span>
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                              {journeyTemplate.milestones.slice(0, 4).map((m: any, idx: number) => (
                                                <div key={idx} className="flex-shrink-0 px-3 py-2 rounded-md border bg-violet-500/5 border-violet-500/20">
                                                  {m.targetWeek && (
                                                    <div className="flex items-center gap-1 mb-1">
                                                      <Badge className="bg-violet-500 text-white text-[9px] px-1">
                                                        Week {m.targetWeek}
                                                      </Badge>
                                                    </div>
                                                  )}
                                                  <p className="text-xs font-medium">{m.title || 'Milestone'}</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Handoff Summary for Delivery Team - Always show */}
                                    <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                                      <div className="flex items-center gap-2 mb-3">
                                        <ArrowRightCircle className="w-5 h-5 text-emerald-600" />
                                        <span className="font-semibold text-emerald-700">Handoff Summary for Delivery</span>
                                      </div>
                                      <div className="grid gap-3 md:grid-cols-3 text-sm">
                                        <div>
                                          <span className="text-xs text-muted-foreground block mb-1">Success Metric</span>
                                          <span className="font-medium">
                                            {c.baselineValue && c.targetValue 
                                              ? `${c.baselineValue} → ${c.targetValue}${c.kpiUnit ? ` ${c.kpiUnit}` : ''}`
                                              : c.targetValue 
                                                ? `Target: ${c.targetValue}${c.kpiUnit ? ` ${c.kpiUnit}` : ''}`
                                                : 'To be defined'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-xs text-muted-foreground block mb-1">Target Timeline</span>
                                          <span className="font-medium">
                                            {journeyTemplate?.typicalTimeline || c.targetDate || 'To be scheduled'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-xs text-muted-foreground block mb-1">Delivery Approach</span>
                                          <span className="font-medium">
                                            {kfSolution || kfOffering?.name || c.solutionPattern || 'To be determined'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>}
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Unified Value Journey - Enhanced with Timeline Groupings and Value Totals */}
        {(() => {
          const allCommitmentsWithPattern = (commitments as any[]).filter(c => c.solutionPattern);
          if (allCommitmentsWithPattern.length === 0) return null;
          
          // Sort outcomes by estimated value (highest first) for priority ordering
          // then by timeline duration (shorter timelines first for quick wins)
          const sortedCommitments = [...allCommitmentsWithPattern].sort((a, b) => {
            const aTimeline = OUTCOME_JOURNEY_TEMPLATES[a.solutionPattern as SolutionPatternId]?.typicalTimeline || "";
            const bTimeline = OUTCOME_JOURNEY_TEMPLATES[b.solutionPattern as SolutionPatternId]?.typicalTimeline || "";
            
            // Extract month numbers for comparison (e.g., "3-6 months" -> 3)
            const aMonths = parseInt(aTimeline.match(/\d+/)?.[0] || "12");
            const bMonths = parseInt(bTimeline.match(/\d+/)?.[0] || "12");
            
            // Primary sort: by value (highest first)
            const aValue = a.estimatedAnnualValue || 0;
            const bValue = b.estimatedAnnualValue || 0;
            if (bValue !== aValue) return bValue - aValue;
            
            // Secondary sort: by timeline (shorter first for quick wins)
            return aMonths - bMonths;
          });
          
          // Group outcomes by similar timelines with value totals
          const timelineGroups: Record<string, { outcomes: typeof sortedCommitments; totalValue: number; monthOrder: number }> = {};
          sortedCommitments.forEach(c => {
            const timeline = OUTCOME_JOURNEY_TEMPLATES[c.solutionPattern as SolutionPatternId]?.typicalTimeline || "Variable";
            const monthOrder = parseInt(timeline.match(/\d+/)?.[0] || "99");
            if (!timelineGroups[timeline]) {
              timelineGroups[timeline] = { outcomes: [], totalValue: 0, monthOrder };
            }
            timelineGroups[timeline].outcomes.push(c);
            timelineGroups[timeline].totalValue += c.estimatedAnnualValue || 0;
          });
          
          // Sort timeline groups by month order
          const sortedTimelineEntries = Object.entries(timelineGroups).sort(
            ([, a], [, b]) => a.monthOrder - b.monthOrder
          );
          
          const selectedOutcomesForTimeline = sortedCommitments.map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
            solutionPattern: c.solutionPattern as SolutionPatternId,
            pillar: (c.valuePillar || 'grow') as ValuePillarId,
            expectedValue: c.estimatedAnnualValue ? `$${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr` : undefined,
            selected: timelineSelectedOutcomes.size === 0 || timelineSelectedOutcomes.has(c.id.toString())
          }));

          const selectedCount = selectedOutcomesForTimeline.filter(o => o.selected).length;
          const totalCount = selectedOutcomesForTimeline.length;
          const selectedValue = sortedCommitments
            .filter(c => timelineSelectedOutcomes.size === 0 || timelineSelectedOutcomes.has(c.id.toString()))
            .reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
          
          return (
            <Card data-testid="unified-journey-section" className="mt-6">
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Unified Value Journey</CardTitle>
                      <CardDescription className="mt-1">
                        Roadmap showing how outcomes will be delivered over time
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedCount}</p>
                      <p className="text-xs text-muted-foreground">Outcomes</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        ${(selectedValue / 1000000).toFixed(2)}M
                      </p>
                      <p className="text-xs text-muted-foreground">Value</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{sortedTimelineEntries.length}</p>
                      <p className="text-xs text-muted-foreground">Phases</p>
                    </div>
                  </div>
                </div>
                
                {/* Selection Controls */}
                <div className="flex items-center gap-2 mt-4">
                  {timelineSelectedOutcomes.size > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTimelineSelectedOutcomes(new Set())}
                      data-testid="button-clear-selection"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Show All ({totalCount})
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedCount < totalCount && `Showing ${selectedCount} of ${totalCount} outcomes`}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Timeline Groupings with Value Totals */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Implementation Timeline
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedTimelineEntries.map(([timeline, { outcomes, totalValue, monthOrder }]) => {
                      const isQuickWin = monthOrder <= 3;
                      const isMedium = monthOrder > 3 && monthOrder <= 9;
                      const isLong = monthOrder > 9;
                      
                      const bgColor = isQuickWin 
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : isMedium 
                          ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-violet-500/5 border-violet-500/20";
                      
                      const iconColor = isQuickWin 
                        ? "text-emerald-600 bg-emerald-500/10"
                        : isMedium 
                          ? "text-blue-600 bg-blue-500/10"
                          : "text-violet-600 bg-violet-500/10";
                      
                      return (
                        <div key={timeline} className={`p-4 rounded-lg border ${bgColor}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center`}>
                                {isQuickWin ? <Zap className="w-4 h-4" /> : 
                                 isMedium ? <Clock className="w-4 h-4" /> : 
                                 <Target className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{timeline}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {isQuickWin ? "Quick Wins" : isMedium ? "Medium Term" : "Strategic"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isQuickWin ? "text-emerald-600" : isMedium ? "text-blue-600" : "text-violet-600"}`}>
                                ${(totalValue / 1000).toFixed(0)}K
                              </p>
                              <p className="text-[10px] text-muted-foreground">{outcomes.length} outcomes</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {outcomes.slice(0, 3).map((c: any) => {
                              const isSelected = timelineSelectedOutcomes.size === 0 || timelineSelectedOutcomes.has(c.id.toString());
                              const journeyTemplate = getJourneyData(c);
                              const phaseCount = journeyTemplate?.phases?.length || 0;
                              
                              return (
                                <div 
                                  key={c.id}
                                  className={`p-2 rounded-lg bg-background border cursor-pointer transition-all ${
                                    isSelected ? "opacity-100" : "opacity-50"
                                  }`}
                                  onClick={() => {
                                    setTimelineSelectedOutcomes(prev => {
                                      const next = new Set(prev);
                                      if (prev.size === 0) {
                                        sortedCommitments.forEach(commitment => {
                                          if (commitment.id !== c.id) {
                                            next.add(commitment.id.toString());
                                          }
                                        });
                                      } else if (next.has(c.id.toString())) {
                                        next.delete(c.id.toString());
                                      } else {
                                        next.add(c.id.toString());
                                      }
                                      return next;
                                    });
                                  }}
                                  data-testid={`timeline-outcome-${c.id}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[10px] font-medium text-muted-foreground">#{c.id}</span>
                                      <span className="text-xs font-medium truncate">{c.name}</span>
                                    </div>
                                    {c.estimatedAnnualValue && (
                                      <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                                        ${(c.estimatedAnnualValue / 1000).toFixed(0)}K
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Progress indicator */}
                                  {phaseCount > 0 && (
                                    <div className="flex gap-0.5 mt-1.5">
                                      {Array.from({ length: Math.min(phaseCount, 6) }).map((_, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`h-1 flex-1 rounded-full ${
                                            idx === 0 ? "bg-emerald-400" : "bg-muted"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {outcomes.length > 3 && (
                              <p className="text-[10px] text-muted-foreground text-center py-1">
                                +{outcomes.length - 3} more outcomes
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Timeline Visualization */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4" />
                    Detailed Journey View
                  </h3>
                  <UnifiedJourneyTimeline
                    selectedOutcomes={selectedOutcomesForTimeline}
                    selectable={true}
                    onOutcomeClick={(outcomeId) => {
                      const commitment = (commitments as any[]).find(c => c.id.toString() === outcomeId);
                      if (commitment) {
                        setViewingJourneyId(commitment.id);
                      }
                    }}
                    onOutcomeToggle={(outcomeId, selected) => {
                      setTimelineSelectedOutcomes(prev => {
                        const next = new Set(prev);
                        if (prev.size === 0) {
                          sortedCommitments.forEach(commitment => {
                            if (selected && commitment.id.toString() === outcomeId) {
                              next.add(commitment.id.toString());
                            } else if (!selected && commitment.id.toString() !== outcomeId) {
                              next.add(commitment.id.toString());
                            }
                          });
                        } else if (selected) {
                          next.add(outcomeId);
                        } else {
                          next.delete(outcomeId);
                        }
                        return next;
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Ready for Delivery Handoff */}
        {confirmedCommitments.length > 0 && (
          <Card className="bg-gradient-to-r from-emerald-500/5 to-violet-500/5 border-emerald-500/20 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                Ready for Delivery Handoff
              </CardTitle>
              <CardDescription>
                {confirmedCommitments.length} outcome(s) confirmed and ready to be handed off to the delivery team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Total Outcome Value
                    <span className="inline-block ml-1 text-[10px] text-muted-foreground/70 cursor-help" title="This represents the estimated annual financial impact when all confirmed outcomes are successfully achieved">
                      (?)
                    </span>
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${(confirmedValue / 1000000).toFixed(2)}M
                  </p>
                </div>
                <Link href={`/projects/${projectId}/handoff`}>
                  <Button data-testid="button-go-to-handoff">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    View Handoff Hub
                  </Button>
                </Link>
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

        {/* View Journey Dialog - Enhanced with Interactive Loop */}
        <Dialog open={viewingJourneyId !== null} onOpenChange={() => setViewingJourneyId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Value Realization Journey
              </DialogTitle>
              <DialogDescription>
                Interactive delivery loop with phases, milestones, and success tracking
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const commitment = (commitments as any[]).find(c => c.id === viewingJourneyId);
              const journeyTemplate = commitment ? getJourneyData(commitment) : null;
              
              if (!commitment || !journeyTemplate) {
                return (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No journey data available for this outcome.</p>
                    <p className="text-sm mt-2">Add a solution pattern to enable journey tracking.</p>
                  </div>
                );
              }
              
              return (
                <Tabs defaultValue="loop" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="loop" className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Interactive Loop
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Timeline View
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="loop" className="mt-0">
                    {/* Outcome Summary */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-4">
                      <h4 className="font-medium mb-1">{commitment.name}</h4>
                      {commitment.outcomeStatement && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Success:</strong> {commitment.outcomeStatement}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {getSolutionPatternBadge(commitment.solutionPattern)}
                        {getValuePillarBadge(commitment.valuePillar)}
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {commitment.implementationTimeline || journeyTemplate.typicalTimeline}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Interactive Journey Loop */}
                    <JourneyLoopVisualizer
                      outcomeName={commitment.name}
                      solutionPattern={commitment.solutionPattern}
                      quickWins={journeyTemplate.quickWins}
                      kpis={[{ 
                        name: commitment.name, 
                        target: commitment.targetValue, 
                        current: commitment.currentValue 
                      }]}
                    />
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="mt-0">
                    <div className="space-y-6 py-4">
                      {/* Outcome Summary */}
                      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-1">{commitment.name}</h4>
                        {commitment.outcomeStatement && (
                          <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">
                            <strong>Success:</strong> {commitment.outcomeStatement}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {getSolutionPatternBadge(commitment.solutionPattern)}
                          {getValuePillarBadge(commitment.valuePillar)}
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {commitment.implementationTimeline || journeyTemplate.typicalTimeline}
                          </Badge>
                        </div>
                      </div>

                      {/* Quick Wins Section */}
                      {journeyTemplate.quickWins.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-medium mb-3">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Quick Wins
                            <span className="text-xs text-muted-foreground font-normal">(Early value indicators)</span>
                          </h4>
                          <div className="grid gap-3 md:grid-cols-3">
                            {journeyTemplate.quickWins.map((qw, idx) => (
                              <div key={idx} className="p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                                <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">{qw.title}</h5>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">{qw.description}</p>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-amber-600 dark:text-amber-500">{qw.timeline}</span>
                                  <span className="text-amber-700 dark:text-amber-300 font-medium">{qw.expectedImpact}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Journey Phases */}
                      <div>
                        <h4 className="flex items-center gap-2 font-medium mb-3">
                          <Layers className="w-4 h-4 text-blue-500" />
                          Implementation Phases
                        </h4>
                        <div className="space-y-4">
                          {journeyTemplate.phases.map((phase, idx) => (
                            <div key={idx} className="relative pl-8">
                              {/* Connector line */}
                              {idx < journeyTemplate.phases.length - 1 && (
                                <div className="absolute left-3 top-8 w-0.5 h-[calc(100%+0.5rem)] bg-blue-200 dark:bg-blue-800" />
                              )}
                              {/* Phase number circle */}
                              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                                {idx + 1}
                              </div>
                              <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">{phase.phase}</h5>
                                  <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                                
                                <div className="grid gap-3 md:grid-cols-2">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Activities</p>
                                    <ul className="space-y-1">
                                      {phase.activities.map((activity, actIdx) => (
                                        <li key={actIdx} className="text-xs flex items-start gap-1">
                                          <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                          {activity}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Milestones</p>
                                    <ul className="space-y-1">
                                      {phase.milestones.map((milestone, mIdx) => (
                                        <li key={mIdx} className="text-xs flex items-start gap-1">
                                          <Flag className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                                          {milestone}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Milestones Timeline */}
                      <div>
                        <h4 className="flex items-center gap-2 font-medium mb-3">
                          <Target className="w-4 h-4 text-violet-500" />
                          Key Milestones
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {journeyTemplate.milestones.map((milestone, idx) => (
                            <div key={idx} className="flex-shrink-0 w-40 p-3 rounded-lg border bg-violet-50/50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800">
                              <div className="flex items-center gap-1 mb-1">
                                <Badge className="bg-violet-500 text-white text-[10px]">Week {milestone.targetWeek}</Badge>
                              </div>
                              <h5 className="text-sm font-medium text-violet-800 dark:text-violet-300 mb-1">{milestone.title}</h5>
                              <p className="text-[10px] text-violet-600 dark:text-violet-400 mb-1">{milestone.description}</p>
                              <p className="text-[10px] text-violet-700 dark:text-violet-300">
                                <strong>Criteria:</strong> {milestone.successCriteria}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingJourneyId(null)}>
                Close
              </Button>
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
            { id: "discover", label: "Discover", icon: Sparkles, progress: workflowProgress.discover, description: "Research & Interaction" },
            { id: "align", label: "Outcomes & Alignment", icon: Target, progress: workflowProgress.align, description: "Design & Confirm Value" },
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
          <TabsList className="grid grid-cols-3 w-full lg:hidden">
            <TabsTrigger value="discover" data-testid="tab-discover">
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="align" data-testid="tab-align">
              <Target className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Align</span>
            </TabsTrigger>
            <TabsTrigger value="handoff" data-testid="tab-handoff">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Handoff</span>
            </TabsTrigger>
          </TabsList>

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
                { step: "questions" as const, label: "Client Interaction", num: 3 },
                { step: "insights" as const, label: "Summary & Coaching", num: 4 }
              ].map((s, idx) => {
                const stepOrder = ["theme-select", "intelligence", "questions", "insights"];
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
          const blueSheet = generateBlueSheetData(project.companyName);

          const themeLabels: Record<string, { name: string; color: string; icon: any }> = {
            leadership: { name: "Leadership Development", color: "blue", icon: Users },
            talent: { name: "Talent Acquisition", color: "purple", icon: UserCheck },
            transformation: { name: "Organizational Transformation", color: "emerald", icon: RefreshCcw },
            rewards: { name: "Total Rewards", color: "amber", icon: DollarSign },
            commercial: { name: "Sales Effectiveness", color: "rose", icon: TrendingUp }
          };
          
          // Loading state
          if (isLoadingIntelligence) {
            return (
              <Card className="border-primary/20">
                <CardContent className="py-16 text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gathering Live Intelligence</h3>
                  <p className="text-muted-foreground">Researching {project.companyName} for {selectedTheme?.label || selectedDiscoveryTheme}...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take 10-20 seconds</p>
                </CardContent>
              </Card>
            );
          }
          
          // Error state
          if (intelligenceError) {
            return (
              <Card className="border-destructive/20">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Intelligence Generation Failed</h3>
                  <p className="text-muted-foreground mb-4">{intelligenceError}</p>
                  <Button 
                    onClick={() => {
                      setIntelligenceError(null);
                      setIsLoadingIntelligence(true);
                      fetchLiveIntelligenceMutation.mutate(selectedDiscoveryTheme || "");
                    }}
                    data-testid="button-retry-intelligence"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          // No data yet
          if (!liveIntelligence) {
            return (
              <Card className="border-primary/20">
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate Intelligence</h3>
                  <p className="text-muted-foreground mb-4">Click below to fetch live company data for {project.companyName}</p>
                  <Button 
                    onClick={() => {
                      setIsLoadingIntelligence(true);
                      fetchLiveIntelligenceMutation.mutate(selectedDiscoveryTheme || "");
                    }}
                    data-testid="button-generate-intelligence"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Live Intelligence
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          // Live data available - render it
          return (
            <>
              {/* Company Overview Card */}
              <Card className="border-primary/20 mb-4">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{project.companyName} - Live Intelligence</CardTitle>
                        <CardDescription>AI-powered research for {selectedTheme?.label || selectedDiscoveryTheme}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Live Data
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          isManualRefreshRef.current = true;
                          setLiveIntelligence(null);
                          setIsLoadingIntelligence(true);
                          fetchLiveIntelligenceMutation.mutate(selectedDiscoveryTheme || "");
                        }}
                        data-testid="button-refresh-intelligence"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Industry</p>
                      <p className="text-sm font-medium">{liveIntelligence.companyOverview.industry}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Headquarters</p>
                      <p className="text-sm font-medium">{liveIntelligence.companyOverview.headquarters}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Employees</p>
                      <p className="text-sm font-medium">{liveIntelligence.companyOverview.employeeCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Revenue</p>
                      <p className="text-sm font-medium">{liveIntelligence.companyOverview.revenue}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overview</p>
                      <p className="text-sm">{liveIntelligence.companyOverview.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Theme-Specific Opportunity Card */}
              <Card className="border-primary/20 mb-4">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Opportunity Signal
                        <Badge className="bg-purple-500/10 text-purple-600">{liveIntelligence.themeSpecificInsights.potentialValue}</Badge>
                      </CardTitle>
                      <CardDescription>{liveIntelligence.themeSpecificInsights.opportunitySignal}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        How Korn Ferry Can Help
                      </h4>
                      <ul className="space-y-2">
                        {liveIntelligence.themeSpecificInsights.howWeHelp.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-500" />
                        Key Discovery Questions
                      </h4>
                      <ul className="space-y-2">
                        {liveIntelligence.themeSpecificInsights.keyQuestions.map((q, idx) => (
                          <li key={idx} className="text-sm p-2 rounded bg-blue-500/5 border border-blue-500/20">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent News */}
              <Card className="border-primary/20 mb-4">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-5 h-5 text-primary" />
                    <CardTitle>Recent News & Developments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveIntelligence.recentNews.map((news, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        news.relevance === 'high' ? 'border-red-500/30 bg-red-500/5' : 
                        news.relevance === 'medium' ? 'border-amber-500/30 bg-amber-500/5' : 
                        'border-muted bg-muted/30'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{news.headline}</p>
                            <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{news.source}</Badge>
                              <span className="text-xs text-muted-foreground">{news.date}</span>
                              {news.opportunityType && (
                                <Badge className="text-xs bg-primary/10 text-primary">{news.opportunityType}</Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-xs shrink-0 ${
                            news.relevance === 'high' ? 'text-red-600 border-red-500/30' : 
                            news.relevance === 'medium' ? 'text-amber-600 border-amber-500/30' : 
                            'text-muted-foreground'
                          }`}>
                            {news.relevance}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Strategic Insights */}
              <Card className="border-primary/20 mb-4">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <CardTitle>Strategic Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveIntelligence.strategicInsights.map((insight, idx) => (
                      <div key={idx} className="p-4 rounded-lg border bg-card hover-elevate">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-semibold">{insight.title}</h4>
                          <Badge className="text-xs bg-green-500/10 text-green-600 shrink-0">{insight.potentialValue}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.insight}</p>
                        <div className="p-2 rounded bg-primary/5 border border-primary/20">
                          <p className="text-xs font-medium text-primary">{insight.kfOpportunity}</p>
                          <p className="text-xs text-muted-foreground mt-1">{insight.relevantCapability}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Key Executives & Competitors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-base">Key Executives</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {liveIntelligence.keyPeople.map((person, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                          <p className="text-sm font-medium">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.title}</p>
                          <p className="text-xs text-blue-600 mt-1">{person.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-purple-500" />
                      <CardTitle className="text-base">Key Competitors</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {liveIntelligence.competitors.map((comp, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                          <p className="text-sm font-medium">{comp.name}</p>
                          <p className="text-xs text-muted-foreground">{comp.description}</p>
                          <p className="text-xs text-purple-600 mt-1">{comp.competitivePosition}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Generated timestamp */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  Intelligence generated: {new Date(liveIntelligence.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* Competitive Intelligence Section */}
              <CompetitiveIntelligence
                projectId={project.id}
                companyName={project.companyName}
                discoveryTheme={selectedDiscoveryTheme || undefined}
                solutionAreas={selectedDiscoveryTheme ? 
                  (selectedDiscoveryTheme === "kf-full-search" 
                    ? ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
                    : selectedDiscoveryTheme === "leadership" ? ["DEVELOP", "ASSESS"]
                    : selectedDiscoveryTheme === "talent-acquisition" ? ["ASSESS", "DEVELOP"]
                    : selectedDiscoveryTheme === "transformation" ? ["TRANSFORM", "ANALYTICS"]
                    : selectedDiscoveryTheme === "rewards" ? ["REWARD"]
                    : selectedDiscoveryTheme === "sales-effectiveness" ? ["COMMERCIAL"]
                    : ["ASSESS", "DEVELOP", "TRANSFORM"]
                  ) : undefined
                }
              />
              
              {/* Salesforce Opportunities - Collapsible */}
              <Collapsible 
                open={!collapsedSections['salesforce-opps']} 
                onOpenChange={(open) => setCollapsedSections(prev => ({...prev, 'salesforce-opps': !open}))}
                className="mt-4"
              >
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50/30 to-background">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover-elevate">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Salesforce Opportunities
                              <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs">{sfData.opportunities.length} Active</Badge>
                            </CardTitle>
                            <CardDescription>Current and pipeline opportunities for this account</CardDescription>
                          </div>
                        </div>
                        {collapsedSections['salesforce-opps'] ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {sfData.opportunities.map((opp) => (
                          <div key={opp.id} className="border rounded-lg p-3 bg-muted/20">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-sm">{opp.name}</h4>
                                  <Badge variant="outline" className={`text-xs ${
                                    opp.stage === "Closed Won" ? "border-green-300 text-green-700" :
                                    opp.stage === "Negotiation" || opp.stage === "Proposal" ? "border-blue-300 text-blue-700" :
                                    "border-gray-300 text-gray-700"
                                  }`}>{opp.stage}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ${(opp.amount / 1000).toFixed(0)}K
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {opp.probability}%
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {opp.owner}
                                  </span>
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Blue Sheet
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <FileText className="w-5 h-5 text-blue-600" />
                                      Blue Sheet: {opp.name}
                                    </DialogTitle>
                                    <DialogDescription>Miller Heiman Strategic Selling Analysis</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                      <h5 className="text-sm font-semibold text-blue-800 mb-1">Single Sales Objective</h5>
                                      <p className="text-sm text-blue-700">{opp.blueSheet.singleSalesObjective}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 rounded-lg border bg-muted/30">
                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ideal Customer Profile</h5>
                                        <p className="text-sm">{opp.blueSheet.idealCustomerProfile}</p>
                                      </div>
                                      <div className="p-3 rounded-lg border bg-muted/30">
                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Competitive Advantage</h5>
                                        <p className="text-sm">{opp.blueSheet.competitiveAdvantage}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-semibold mb-2">Red Flags</h5>
                                      <div className="space-y-2">
                                        {opp.redFlags.map((flag, idx) => (
                                          <div key={idx} className="flex items-start gap-2 p-2 rounded bg-red-50 border border-red-200">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-red-700">{flag}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-semibold mb-2">Green Flags</h5>
                                      <div className="space-y-2">
                                        {opp.greenFlags.map((flag, idx) => (
                                          <div key={idx} className="flex items-start gap-2 p-2 rounded bg-green-50 border border-green-200">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-green-700">{flag}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Side by Side: Common Buying Influences + Competitor Win/Loss - Collapsible */}
              <Collapsible 
                open={!collapsedSections['insights-panel']} 
                onOpenChange={(open) => setCollapsedSections(prev => ({...prev, 'insights-panel': !open}))}
                className="mt-4"
              >
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50/30 to-background">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover-elevate">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Account Insights
                              <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-xs">Miller Heiman</Badge>
                            </CardTitle>
                            <CardDescription>Key stakeholders across deals & competitive win/loss record</CardDescription>
                          </div>
                        </div>
                        {collapsedSections['insights-panel'] ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Common Buying Influences */}
                        <div className="border rounded-lg p-4 bg-muted/20">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            Common Buying Influences
                            <Badge variant="outline" className="text-xs">{sfData.crossOpportunityInfluences.length} contacts</Badge>
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">Stakeholders appearing in 2+ opportunities</p>
                          {sfData.crossOpportunityInfluences.length > 0 ? (
                            <div className="space-y-2">
                              {sfData.crossOpportunityInfluences.map((influence, idx) => (
                                <div key={idx} className="p-2 rounded border bg-background">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-medium text-sm">{influence.name}</span>
                                    <Badge variant="outline" className={`text-xs ${
                                      influence.role === "economic_buyer" ? "border-amber-300 text-amber-700" :
                                      influence.role === "champion" ? "border-purple-300 text-purple-700" :
                                      "border-blue-300 text-blue-700"
                                    }`}>
                                      {influence.role.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{influence.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Appears in: {influence.opportunities.length} deals
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No contacts appear in multiple opportunities</p>
                          )}
                        </div>

                        {/* Competitor Win/Loss Record */}
                        <div className="border rounded-lg p-4 bg-muted/20">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-rose-600" />
                            Competitor Win/Loss Record
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">Historical performance against competitors</p>
                          <div className="space-y-2">
                            {Object.entries(sfData.competitorStats).map(([competitor, stats], idx) => {
                              const total = stats.wins + stats.losses;
                              const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
                              return (
                                <div key={idx} className="p-2 rounded border bg-background">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-medium text-sm">{competitor}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge className={`text-xs ${
                                        winRate >= 50 ? "bg-green-100 text-green-700 border-green-200" : 
                                        "bg-red-100 text-red-700 border-red-200"
                                      }`}>
                                        {winRate}% win rate
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      {stats.wins} won
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                      {stats.losses} lost
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    Deals: {stats.deals.slice(0, 2).join(', ')}{stats.deals.length > 2 ? '...' : ''}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Deal History Summary */}
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Recent Deal History</h5>
                            <div className="space-y-1">
                              {sfData.dealHistory.slice(0, 3).map((deal, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="truncate flex-1 mr-2">{deal.name.replace(project?.companyName + ' - ', '')}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">${(deal.amount / 1000).toFixed(0)}K</span>
                                    <Badge className={`text-xs ${
                                      deal.status === "won" ? "bg-green-100 text-green-700 border-green-200" : 
                                      "bg-red-100 text-red-700 border-red-200"
                                    }`}>
                                      {deal.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* Probe Intelligence Chat Box - Collapsible */}
              {intelligenceIsSaved && (
                <Collapsible 
                  open={!collapsedSections['probe-chat']} 
                  onOpenChange={(open) => setCollapsedSections(prev => ({...prev, 'probe-chat': !open}))}
                  className="mt-4"
                >
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-background">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover-elevate">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <MessageSquare className="w-5 h-5 text-purple-600" />
                              Ask Follow-up Questions
                              {probeHistory.length > 0 && (
                                <Badge variant="outline" className="text-xs">{probeHistory.length} messages</Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Probe deeper into the intelligence
                            </p>
                          </div>
                          {collapsedSections['probe-chat'] ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        {/* Probe History */}
                        {probeHistory.length > 0 && (
                          <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3 bg-background">
                            {probeHistory.map((msg, idx) => (
                              <div 
                                key={idx} 
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div 
                                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                    msg.role === "user" 
                                      ? "bg-purple-600 text-white" 
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                  <p className="text-xs opacity-60 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Input Area */}
                        <div className="flex gap-2">
                          <Input
                            value={probeQuestion}
                            onChange={(e) => setProbeQuestion(e.target.value)}
                            placeholder="e.g., What are the main leadership challenges they're facing?"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && probeQuestion.trim() && !isProbing && selectedDiscoveryTheme) {
                                setIsProbing(true);
                                probeIntelligenceMutation.mutate({ theme: selectedDiscoveryTheme, question: probeQuestion.trim() });
                              }
                            }}
                            disabled={isProbing}
                            data-testid="input-probe-question"
                            className="flex-1"
                          />
                          <Button
                            onClick={() => {
                              if (probeQuestion.trim() && selectedDiscoveryTheme) {
                                setIsProbing(true);
                                probeIntelligenceMutation.mutate({ theme: selectedDiscoveryTheme, question: probeQuestion.trim() });
                              }
                            }}
                            disabled={!probeQuestion.trim() || isProbing}
                            data-testid="button-submit-probe"
                          >
                            {isProbing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Thinking...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Ask
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Navigation for Intelligence Step */}
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setDiscoveryStep("theme-select")} data-testid="button-back-to-theme">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Theme
                </Button>
                <Button onClick={() => setDiscoveryStep("questions")} data-testid="button-next-to-questions">
                  Continue to Client Interaction
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
                            {lastSavedGreenSheet && (
                              <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" />
                                Saved {lastSavedGreenSheet}
                              </span>
                            )}
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
                    {/* Meeting Mode Toggle - Single vs Multiple Attendees */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-sm text-emerald-800">Meeting Type</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={meetingMode === "single" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMeetingMode("single")}
                          className={meetingMode === "single" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          data-testid="button-single-attendee"
                        >
                          <UserCircle className="w-4 h-4 mr-1.5" />
                          Single Attendee
                        </Button>
                        <Button
                          variant={meetingMode === "multiple" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMeetingMode("multiple")}
                          className={meetingMode === "multiple" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          data-testid="button-multiple-attendees"
                        >
                          <Users className="w-4 h-4 mr-1.5" />
                          Multiple Attendees
                        </Button>
                      </div>
                    </div>

                    {/* Single Attendee Mode - Original Contact Form */}
                    {meetingMode === "single" && (
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
                    )}

                    {/* Multiple Attendees Mode - Attendee Roster */}
                    {meetingMode === "multiple" && (
                    <div className="p-4 rounded-xl border-2 border-emerald-500/20 bg-white/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-emerald-800">
                          <Users className="w-5 h-5" />
                          Meeting Attendees ({meetingAttendees.length})
                          <span className="text-xs font-normal text-muted-foreground">(Add all stakeholders)</span>
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => {
                            setEditingAttendee(null);
                            setShowAddAttendeeDialog(true);
                          }}
                          data-testid="button-add-attendee"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Attendee
                        </Button>
                      </div>

                      {/* Attendee List */}
                      {meetingAttendees.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground" data-testid="empty-attendees-state">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No attendees added yet</p>
                          <p className="text-xs mt-1">Add stakeholders to generate a combined meeting story</p>
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2" data-testid="attendees-list">
                          {meetingAttendees.map((attendee, index) => (
                            <div
                              key={`attendee-${index}`}
                              className="p-3 rounded-lg border bg-white flex items-start justify-between gap-3"
                              data-testid={`card-attendee-${index}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate" data-testid={`text-attendee-name-${index}`}>{attendee.name}</div>
                                <div className="text-xs text-muted-foreground truncate" data-testid={`text-attendee-title-${index}`}>{attendee.title}</div>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <Badge variant="secondary" className="text-xs" data-testid={`badge-attendee-role-${index}`}>
                                    {attendee.role?.replace("_", " ") || "Unknown Role"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-attendee-influence-${index}`}>
                                    {attendee.influence || "Unknown"} Influence
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setEditingAttendee({ ...attendee, id: `idx-${index}` });
                                    setShowAddAttendeeDialog(true);
                                  }}
                                  data-testid={`button-edit-attendee-${index}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    setMeetingAttendees(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  data-testid={`button-remove-attendee-${index}`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Green Sheet - Call Framework (SOURCE FOR AI GENERATION) */}
                      {meetingAttendees.length >= 2 && (
                        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-4 mt-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            <h5 className="font-semibold text-emerald-800">Green Sheet - Meeting Framework</h5>
                            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">Context for AI</Badge>
                          </div>
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
                                  className="min-h-[70px] text-sm bg-white border-emerald-300 focus:border-emerald-500"
                                  data-testid="input-call-objective-multi"
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
                                  className="min-h-[70px] text-sm bg-white border-emerald-300 focus:border-emerald-500"
                                  data-testid="input-desired-outcome-multi"
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
                                  className="min-h-[70px] text-sm bg-white border-emerald-300 focus:border-emerald-500"
                                  data-testid="input-opening-statement-multi"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                                  Best Action Commitment
                                </Label>
                                <Textarea 
                                  placeholder="What specific next step or commitment will you ask for?"
                                  value={greenSheetEdits.bestActionCommitment}
                                  onChange={(e) => setGreenSheetEdits(prev => ({ ...prev, bestActionCommitment: e.target.value }))}
                                  className="min-h-[70px] text-sm bg-white border-emerald-300 focus:border-emerald-500"
                                  data-testid="input-best-action-multi"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generate Combined Story Button */}
                      {meetingAttendees.length >= 2 && (
                        <div className="pt-2">
                          <Button
                            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            onClick={generateMeetingStory}
                            disabled={isGeneratingStory}
                            data-testid="button-generate-combined-story"
                          >
                            {isGeneratingStory ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Synthesizing Stakeholder Perspectives...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Generate Combined Meeting Story
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Combined Meeting Story Display */}
                      {combinedMeetingStory && (
                        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                              <h5 className="font-semibold text-purple-800">Combined Meeting Story</h5>
                            </div>
                            <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                              Generated {new Date(combinedMeetingStory.generatedAt).toLocaleDateString()}
                            </Badge>
                          </div>
                          
                          <div className="space-y-4" data-testid="combined-story-content">
                            {/* Main Narrative */}
                            {combinedMeetingStory.narrative && (
                            <div>
                              <Label className="text-xs text-purple-600 font-medium">Narrative</Label>
                              <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed" data-testid="text-story-narrative">{combinedMeetingStory.narrative}</p>
                            </div>
                            )}

                            {/* Key Themes */}
                            {(combinedMeetingStory.keyThemes ?? []).length > 0 && (
                              <div>
                                <Label className="text-xs text-purple-600 font-medium">Key Themes</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {(combinedMeetingStory.keyThemes ?? []).map((theme, i) => (
                                    <Badge key={i} className="bg-purple-100 text-purple-700 border-purple-200" data-testid={`badge-theme-${i}`}>{theme}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Talking Points */}
                            {(combinedMeetingStory.talkingPoints ?? []).length > 0 && (
                              <div>
                                <Label className="text-xs text-purple-600 font-medium">Talking Points</Label>
                                <div className="space-y-2 mt-2">
                                  {(combinedMeetingStory.talkingPoints ?? []).map((tp, i) => (
                                    <div key={i} className="p-2 rounded bg-white/60 border border-purple-100" data-testid={`card-talking-point-${i}`}>
                                      <p className="text-sm font-medium">{tp.point}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        For: {(tp.targetAudience ?? []).join(", ")}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Agenda */}
                            {(combinedMeetingStory.agenda ?? []).length > 0 && (
                              <div>
                                <Label className="text-xs text-purple-600 font-medium">Suggested Agenda</Label>
                                <div className="space-y-2 mt-2">
                                  {(combinedMeetingStory.agenda ?? []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-white/60 border border-purple-100" data-testid={`card-agenda-${i}`}>
                                      <Badge variant="outline" className="text-[10px] shrink-0">{item.duration}</Badge>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">{item.topic}</p>
                                        <p className="text-xs text-muted-foreground">{item.leadWith}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Objection Handling */}
                            {(combinedMeetingStory.objectionHandling ?? []).length > 0 && (
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center gap-2 text-xs text-purple-600 font-medium hover:text-purple-800" data-testid="trigger-objection-handling">
                                  <ChevronRight className="w-3 h-3" />
                                  Objection Handling ({(combinedMeetingStory.objectionHandling ?? []).length})
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-2 mt-2">
                                  {(combinedMeetingStory.objectionHandling ?? []).map((obj, i) => (
                                    <div key={i} className="p-2 rounded bg-orange-50 border border-orange-200" data-testid={`card-objection-${i}`}>
                                      <p className="text-sm font-medium text-orange-800">{obj.objection}</p>
                                      <p className="text-sm mt-1 text-orange-700">{obj.response}</p>
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                    
                    {/* Editable Call Framework */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-emerald-600" />
                              Call Objective
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary hover:text-primary/80"
                              onClick={() => { setVoiceTargetField("objective"); setIsVoiceCommandOpen(true); }}
                              data-testid="button-voice-objective"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
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
                          <Label className="text-xs font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Desired Outcome / Commitment
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary hover:text-primary/80"
                              onClick={() => { setVoiceTargetField("desiredOutcome"); setIsVoiceCommandOpen(true); }}
                              data-testid="button-voice-outcome"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
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
                          <Label className="text-xs font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              Your Opening Statement
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary hover:text-primary/80"
                              onClick={() => { setVoiceTargetField("openingStatement"); setIsVoiceCommandOpen(true); }}
                              data-testid="button-voice-opening"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
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
                          <Label className="text-xs font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-emerald-600" />
                              Best Action Commitment (What you'll ask for)
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary hover:text-primary/80"
                              onClick={() => { setVoiceTargetField("bestActionCommitment"); setIsVoiceCommandOpen(true); }}
                              data-testid="button-voice-commitment"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
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

            {/* Story Coach - 3-Phase Storytelling Framework */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Story Coach
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">3-Phase Framework</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        Craft compelling stories for {project?.companyName} with guided coaching
                        {storyBuilderLastSaved && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-700 border-green-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {storyBuilderLastSaved}
                          </Badge>
                        )}
                        {saveStoryBuilderMutation.isPending && (
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
                      variant="default"
                      className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                      onClick={() => {
                        const phase = activeStoryPhase === "test" ? "after" : activeStoryPhase;
                        setAiSuggestionLoading("all");
                        storySuggestionMutation.mutate({ 
                          fieldToSuggest: "all", 
                          phase: phase as "before" | "during" | "after",
                          stories: [] 
                        });
                      }}
                      disabled={aiSuggestionLoading !== null || activeStoryPhase === "test"}
                      data-testid="button-generate-all-story"
                    >
                      {aiSuggestionLoading === "all" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate All ({activeStoryPhase === "test" ? "After" : activeStoryPhase.toUpperCase()})
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const content = `
STORY FRAMEWORK - ${project?.companyName}
${new Date().toLocaleDateString()}
${"=".repeat(50)}

=== BEFORE: CRAFTING THE STORY ===
Single Message: ${storyBuilderData.before.singleMessage || "(Not set)"}
Emotional Reaction: ${storyBuilderData.before.emotionalReaction || "(Not set)"}
Starting Hook: ${storyBuilderData.before.startingHook || "(Not set)"}
Story Structure: ${storyBuilderData.before.storyStructure || "(Not set)"}
Hero/Characters: ${storyBuilderData.before.heroCharacter || "(Not set)"}
Evidence: ${storyBuilderData.before.evidenceToReference || "(Not set)"}
Tension Questions: ${storyBuilderData.before.tensionQuestions.length > 0 ? storyBuilderData.before.tensionQuestions.map(q => `\n  - ${q.prompt}${q.response ? ` (Response: ${q.response})` : ''}`).join('') : "(None set)"}

=== DURING: TELLING THE STORY ===
Opening Line: ${storyBuilderData.during.openingLine || "(Not set)"}
Turning Point: ${storyBuilderData.during.turningPoint || "(Not set)"}
Key Data Points: ${storyBuilderData.during.keyDataPoints || "(Not set)"}
Pacing Notes: ${storyBuilderData.during.pacingNotes || "(Not set)"}

=== AFTER: LANDING THE STORY ===
Moment of Meaning: ${storyBuilderData.after.momentOfMeaning || "(Not set)"}
Explicit Takeaway: ${storyBuilderData.after.explicitTakeaway || "(Not set)"}
Call to Action: ${storyBuilderData.after.callToAction || "(Not set)"}

=== STORY TEST ===
Stranger Care Score: ${storyBuilderData.storyTest.strangerCareScore ?? "Not rated"}/5
Simplicity Score: ${storyBuilderData.storyTest.simplicityScore ?? "Not rated"}/5
Leadership Values Score: ${storyBuilderData.storyTest.leadershipValuesScore ?? "Not rated"}/5
                        `.trim();
                        navigator.clipboard.writeText(content);
                        toast({ title: "Copied to clipboard", description: "Story framework exported" });
                      }}
                      data-testid="button-export-story"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Story Coach Tabs - BEFORE / DURING / AFTER / TEST */}
                <Tabs value={activeStoryPhase} onValueChange={(v) => setActiveStoryPhase(v as "before" | "during" | "after" | "test")} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-6">
                    <TabsTrigger value="before" className="flex items-center gap-2">
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">BEFORE</span>
                      <span className="sm:hidden">1</span>
                    </TabsTrigger>
                    <TabsTrigger value="during" className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">DURING</span>
                      <span className="sm:hidden">2</span>
                    </TabsTrigger>
                    <TabsTrigger value="after" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="hidden sm:inline">AFTER</span>
                      <span className="sm:hidden">3</span>
                    </TabsTrigger>
                    <TabsTrigger value="test" className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">TEST</span>
                      <span className="sm:hidden">!</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* BEFORE Tab - Crafting the Story */}
                  <TabsContent value="before" className="space-y-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold text-emerald-700">BEFORE: Crafting the Story</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Design your story before you tell it. Answer these 7 questions to create a compelling narrative.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* 1. Single Message */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <Label className="font-medium">What's the single (provocative) message?</Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => { setVoiceTargetField("singleMessage"); setIsVoiceCommandOpen(true); }}
                              className="text-primary h-7 w-7"
                              data-testid="button-voice-single-message"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAiSuggestWithStories("singleMessage", [])}
                              disabled={aiSuggestionLoading === "singleMessage"}
                              className="text-primary h-7"
                              data-testid="button-ai-single-message"
                            >
                              {aiSuggestionLoading === "singleMessage" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              <span className="ml-1 text-xs">Coach</span>
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          What is the one idea you need them to remember? Can you express it in one sentence?
                        </p>
                        <Textarea
                          placeholder="The single idea they MUST remember from your story..."
                          value={storyBuilderData.before.singleMessage}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, singleMessage: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-single-message"
                        />
                      </div>

                      {/* 2. Emotional Reaction */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                            <Label className="font-medium">What emotional reaction do I seek?</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAiSuggestWithStories("emotionalReaction", [])}
                            disabled={aiSuggestionLoading === "emotionalReaction"}
                            className="text-primary h-7"
                            data-testid="button-ai-emotional"
                          >
                            {aiSuggestionLoading === "emotionalReaction" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="ml-1 text-xs">Coach</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          What should they feel? (Momentum? Urgency? Hope? Resolve?) What is at stake in this story?
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {["Momentum", "Urgency", "Hope", "Resolve", "Curiosity", "Concern"].map(emotion => (
                            <Badge
                              key={emotion}
                              variant={storyBuilderData.before.emotionalReaction === emotion ? "default" : "outline"}
                              className="cursor-pointer hover-elevate"
                              onClick={() => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, emotionalReaction: emotion }}))}
                            >
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Describe the emotional response you want to create..."
                          value={storyBuilderData.before.emotionalReaction}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, emotionalReaction: e.target.value }}))}
                          className="min-h-[40px] text-sm"
                          data-testid="input-emotional-reaction"
                        />
                      </div>

                      {/* 3. Starting Hook */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                            <Label className="font-medium">What's the right starting hook?</Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => { setVoiceTargetField("startingHook"); setIsVoiceCommandOpen(true); }}
                              className="text-primary h-7 w-7"
                              data-testid="button-voice-hook"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAiSuggestWithStories("startingHook", [])}
                              disabled={aiSuggestionLoading === "startingHook"}
                              className="text-primary h-7"
                              data-testid="button-ai-hook"
                            >
                              {aiSuggestionLoading === "startingHook" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              <span className="ml-1 text-xs">Coach</span>
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          A moment of high tension. A provocative question. A vivid scene ("Picture this…"). A surprising fact or reversal…
                        </p>
                        <Textarea
                          placeholder="Your attention-grabbing opening..."
                          value={storyBuilderData.before.startingHook}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, startingHook: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-starting-hook"
                        />
                      </div>

                      {/* 4. Story Structure */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                          <Label className="font-medium">What's the structure for the story?</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          Choose a narrative structure that guides your story flow
                        </p>
                        <Select
                          value={storyBuilderData.before.storyStructure}
                          onValueChange={(v) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, storyStructure: v }}))}
                        >
                          <SelectTrigger data-testid="select-story-structure">
                            <SelectValue placeholder="Select a story structure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="situation-struggle-insight-outcome">Situation → Struggle → Insight → Outcome</SelectItem>
                            <SelectItem value="problem-agitate-solve">Problem → Agitate → Solve</SelectItem>
                            <SelectItem value="before-after-bridge">Before → After → Bridge</SelectItem>
                            <SelectItem value="context-action-result">Context → Action → Result</SelectItem>
                            <SelectItem value="hero-journey">Hero's Journey (Challenge → Transformation)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 5. Hero/Characters */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">5</span>
                            <Label className="font-medium">Who's my hero? Identify the characters</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAiSuggestWithStories("heroCharacter", [])}
                            disabled={aiSuggestionLoading === "heroCharacter"}
                            className="text-primary h-7"
                            data-testid="button-ai-hero"
                          >
                            {aiSuggestionLoading === "heroCharacter" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="ml-1 text-xs">Coach</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          How are they involved? What were their motivations or concerns? How did they change?
                        </p>
                        <Textarea
                          placeholder="Describe your hero and key characters..."
                          value={storyBuilderData.before.heroCharacter}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, heroCharacter: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-hero-character"
                        />
                      </div>

                      {/* 6. Evidence */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">6</span>
                            <Label className="font-medium">What evidence will I reference to build trust?</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              setIsGeneratingStories(true);
                              try {
                                const response = await apiRequest("POST", `/api/projects/${projectId}/ai/suggest-success-stories`, {
                                  companyName: project?.companyName,
                                  industry: project?.sector,
                                  theme: selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : "Leadership Development",
                                  keyMessage: storyBuilderData.before.singleMessage,
                                  insights: insights?.slice(0, 3).map((i: any) => i.label) || []
                                });
                                const data = await response.json();
                                if (data.stories && data.stories.length > 0) {
                                  setSuggestedStories(data.stories);
                                  toast({ title: "Stories found", description: `${data.stories.length} relevant success stories` });
                                }
                              } catch (error) {
                                toast({ title: "Could not find stories", variant: "destructive" });
                              }
                              setIsGeneratingStories(false);
                            }}
                            disabled={isGeneratingStories}
                            className="h-7 text-xs"
                            data-testid="button-find-evidence"
                          >
                            {isGeneratingStories ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Trophy className="w-3 h-3 mr-1" />}
                            Find Stories
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          Data points, success stories, case studies, or testimonials that support your message
                        </p>
                        <Textarea
                          placeholder="Evidence, data, or success stories you'll reference..."
                          value={storyBuilderData.before.evidenceToReference}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, evidenceToReference: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-evidence"
                        />
                        {suggestedStories.length > 0 && (
                          <div className="mt-3 space-y-2 p-3 rounded-lg bg-blue-50/50 border border-blue-200/50">
                            <p className="text-xs font-medium text-blue-700 flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> Relevant Success Stories
                            </p>
                            {suggestedStories.map((story, idx) => (
                              <div 
                                key={idx} 
                                className="p-2 rounded bg-white/80 text-xs cursor-pointer hover:bg-blue-100/50"
                                onClick={() => {
                                  setStoryBuilderData(prev => ({ 
                                    ...prev, 
                                    before: { 
                                      ...prev.before, 
                                      evidenceToReference: `${story.title}: ${story.outcome}` 
                                    }
                                  }));
                                  toast({ title: "Story added" });
                                }}
                              >
                                <p className="font-medium">{story.title}</p>
                                <p className="text-muted-foreground">{story.outcome}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 7. Tension Questions - Array-based with popup selector */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">7</span>
                            <Label className="font-medium">What questions keep the story moving?</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTensionQuestionsDialogOpen(true)}
                            className="h-7 gap-1"
                            data-testid="button-add-tension-questions"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="text-xs">Add Questions</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 italic">
                          Dilemmas, pressure points, uncertainties… questions tailored to your contact and discovery themes that keep them engaged.
                        </p>
                        
                        {/* Display selected tension questions */}
                        {storyBuilderData.before.tensionQuestions.length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed rounded-lg">
                            <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">No questions added yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Click "Add Questions" to get AI-powered recommendations based on your contact and discovery</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {storyBuilderData.before.tensionQuestions.map((question, index) => (
                              <div key={question.id} className="p-3 rounded-lg border bg-background">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] shrink-0 ${
                                        question.methodology === "SPIN" ? "bg-blue-500/10 text-blue-700 border-blue-500/30" :
                                        question.methodology === "MILLER_HEIMAN" ? "bg-purple-500/10 text-purple-700 border-purple-500/30" :
                                        question.methodology === "PSS" ? "bg-amber-500/10 text-amber-700 border-amber-500/30" :
                                        "bg-gray-500/10 text-gray-700 border-gray-500/30"
                                      }`}
                                    >
                                      {question.methodology === "MILLER_HEIMAN" ? "Miller Heiman" : question.methodology}
                                    </Badge>
                                    {question.source === "ai" && (
                                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                        AI
                                      </Badge>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      setStoryBuilderData(prev => ({
                                        ...prev,
                                        before: {
                                          ...prev.before,
                                          tensionQuestions: prev.before.tensionQuestions.filter(q => q.id !== question.id)
                                        }
                                      }));
                                    }}
                                    data-testid={`button-remove-question-${index}`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium mb-2">{question.prompt}</p>
                                {question.rationale && (
                                  <p className="text-xs text-muted-foreground mb-2 italic">{question.rationale}</p>
                                )}
                                <Textarea
                                  placeholder="Add your notes or the response you received..."
                                  value={question.response}
                                  onChange={(e) => {
                                    setStoryBuilderData(prev => ({
                                      ...prev,
                                      before: {
                                        ...prev.before,
                                        tensionQuestions: prev.before.tensionQuestions.map(q => 
                                          q.id === question.id ? { ...q, response: e.target.value } : q
                                        )
                                      }
                                    }));
                                  }}
                                  className="min-h-[50px] text-sm"
                                  data-testid={`input-question-response-${index}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coach Review for BEFORE */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-emerald-700">Coach Review</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {!storyBuilderData.before.singleMessage && (
                          <p className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Start with your single message - the one idea they must remember
                          </p>
                        )}
                        {storyBuilderData.before.singleMessage && storyBuilderData.before.singleMessage.split(' ').length > 25 && (
                          <p className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Your message is too long. Can you say it in one sentence?
                          </p>
                        )}
                        {!storyBuilderData.before.startingHook && storyBuilderData.before.singleMessage && (
                          <p className="text-blue-600 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Now add a hook to grab attention immediately
                          </p>
                        )}
                        {storyBuilderData.before.singleMessage && storyBuilderData.before.startingHook && !storyBuilderData.before.heroCharacter && (
                          <p className="text-blue-600 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Who is your hero? Every story needs a protagonist
                          </p>
                        )}
                        {Object.values(storyBuilderData.before).filter(v => v && v.length > 0).length >= 5 && (
                          <p className="text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Your story foundation is solid! Move to DURING to plan the delivery
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* DURING Tab - Telling the Story */}
                  <TabsContent value="during" className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-blue-700">DURING: Telling the Story</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Deliver your story with impact. Focus on pacing, turning points, and keeping it conversational.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Coaching Tips */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/50 flex items-start gap-2">
                          <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Start fast — no preamble</p>
                            <p className="text-xs text-muted-foreground">Enter the story at the moment of action</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/50 flex items-start gap-2">
                          <Film className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Pace like a movie</p>
                            <p className="text-xs text-muted-foreground">Short sentences in tension, longer in reflection</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/50 flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Keep it conversational</p>
                            <p className="text-xs text-muted-foreground">Speak like a human, not a presentation script</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/50 flex items-start gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Don't over-explain data</p>
                            <p className="text-xs text-muted-foreground">Data supports the story, not replaces it</p>
                          </div>
                        </div>
                      </div>

                      {/* Opening Line */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <Label className="font-medium">Your Opening Line</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAiSuggestWithStories("openingLine", [])}
                            disabled={aiSuggestionLoading === "openingLine"}
                            className="text-primary h-7"
                            data-testid="button-ai-opening"
                          >
                            {aiSuggestionLoading === "openingLine" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="ml-1 text-xs">Coach</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          Enter the story at the moment of action - no warm-up needed
                        </p>
                        <Textarea
                          placeholder="Your first line that drops them right into the action..."
                          value={storyBuilderData.during.openingLine}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, openingLine: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-opening-line"
                        />
                      </div>

                      {/* Turning Point */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                            <Label className="font-medium">The Turning Point</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAiSuggestWithStories("turningPoint", [])}
                            disabled={aiSuggestionLoading === "turningPoint"}
                            className="text-primary h-7"
                            data-testid="button-ai-turning"
                          >
                            {aiSuggestionLoading === "turningPoint" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="ml-1 text-xs">Coach</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          What realisation changed the course? Why did that moment matter?
                        </p>
                        <Textarea
                          placeholder="The pivotal moment when everything changed..."
                          value={storyBuilderData.during.turningPoint}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, turningPoint: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-turning-point"
                        />
                      </div>

                      {/* Key Data Points */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                          <Label className="font-medium">Key Data Points (supporting evidence)</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          Data becomes supporting evidence after the story - don't lead with it
                        </p>
                        <Textarea
                          placeholder="The 2-3 data points that support your story..."
                          value={storyBuilderData.during.keyDataPoints}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, keyDataPoints: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-data-points"
                        />
                      </div>

                      {/* Pacing Notes */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                          <Label className="font-medium">Pacing Notes & Pause Points</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          Where will you pause for effect? Where will you speed up for tension?
                        </p>
                        <Textarea
                          placeholder="Notes on where to pause, speed up, slow down..."
                          value={storyBuilderData.during.pacingNotes}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, pacingNotes: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-pacing-notes"
                        />
                      </div>
                    </div>

                    {/* Coach Review for DURING */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-700">Coach Review</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {!storyBuilderData.during.openingLine && (
                          <p className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Craft your opening line - enter the story at the moment of action
                          </p>
                        )}
                        {storyBuilderData.during.openingLine && storyBuilderData.during.openingLine.toLowerCase().startsWith("i want to") && (
                          <p className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Skip the preamble! Start with action, not "I want to tell you..."
                          </p>
                        )}
                        {!storyBuilderData.during.turningPoint && storyBuilderData.during.openingLine && (
                          <p className="text-blue-600 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Every great story has a turning point - what changed everything?
                          </p>
                        )}
                        {storyBuilderData.during.openingLine && storyBuilderData.during.turningPoint && (
                          <p className="text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Great! You have the core of your delivery. Move to AFTER to land it
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* AFTER Tab - Landing the Story */}
                  <TabsContent value="after" className="space-y-4">
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-amber-700">AFTER: Landing the Story</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Finish strong with meaning, a clear takeaway, and a call to action.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Moment of Meaning */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <Label className="font-medium">Finish with a "moment of meaning"</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAiSuggestWithStories("momentOfMeaning", [])}
                            disabled={aiSuggestionLoading === "momentOfMeaning"}
                            className="text-primary h-7"
                            data-testid="button-ai-meaning"
                          >
                            {aiSuggestionLoading === "momentOfMeaning" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="ml-1 text-xs">Coach</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          A crisp insight. A forward-looking question. A short reflective conclusion.
                        </p>
                        <Textarea
                          placeholder="The meaningful conclusion that resonates..."
                          value={storyBuilderData.after.momentOfMeaning}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, after: { ...prev.after, momentOfMeaning: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-moment-meaning"
                        />
                      </div>

                      {/* Explicit Takeaway */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                            <Label className="font-medium">Make the takeaway explicit — but not obvious</Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAiSuggestWithStories("explicitTakeaway", [])}
                            disabled={aiSuggestionLoading === "explicitTakeaway"}
                            className="text-primary h-7"
                            data-testid="button-ai-takeaway"
                          >
                            {aiSuggestionLoading === "explicitTakeaway" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="ml-1 text-xs">Coach</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          Connect story → action. What should they do with what they've learned?
                        </p>
                        <Textarea
                          placeholder="The clear takeaway that connects to action..."
                          value={storyBuilderData.after.explicitTakeaway}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, after: { ...prev.after, explicitTakeaway: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-explicit-takeaway"
                        />
                      </div>

                      {/* Call to Action */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                            <Label className="font-medium">Call to Action</Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => { setVoiceTargetField("callToAction"); setIsVoiceCommandOpen(true); }}
                              className="text-primary h-7 w-7"
                              data-testid="button-voice-cta"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAiSuggestWithStories("callToAction", [])}
                              disabled={aiSuggestionLoading === "callToAction"}
                              className="text-primary h-7"
                              data-testid="button-ai-cta"
                            >
                              {aiSuggestionLoading === "callToAction" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              <span className="ml-1 text-xs">Coach</span>
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 italic">
                          What's the next step you want them to take?
                        </p>
                        <Textarea
                          placeholder="Based on what we've discussed, I'd love to..."
                          value={storyBuilderData.after.callToAction}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, after: { ...prev.after, callToAction: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-call-to-action"
                        />
                      </div>
                    </div>

                    {/* Coach Review for AFTER */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-700">Coach Review</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {!storyBuilderData.after.momentOfMeaning && (
                          <p className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            End with meaning - what's the insight they should remember?
                          </p>
                        )}
                        {!storyBuilderData.after.callToAction && storyBuilderData.after.momentOfMeaning && (
                          <p className="text-blue-600 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Add a call to action - what should they do next?
                          </p>
                        )}
                        {storyBuilderData.after.momentOfMeaning && storyBuilderData.after.callToAction && (
                          <p className="text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Excellent! Your story is ready. Now TEST it to make sure it lands
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TEST Tab - Story Validation */}
                  <TabsContent value="test" className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-purple-700">TEST YOUR STORY!</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Answer these 3 questions to validate your story is ready to tell.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Test 1: Stranger Care */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                          <Label className="font-medium">Would a stranger care?</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          If not, sharpen the tension or emotional core.
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <Button
                              key={score}
                              size="sm"
                              variant={storyBuilderData.storyTest.strangerCareScore === score ? "default" : "outline"}
                              onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, strangerCareScore: score }}))}
                              className={`w-10 h-10 ${storyBuilderData.storyTest.strangerCareScore === score ? (score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-500') : ''}`}
                              data-testid={`button-stranger-score-${score}`}
                            >
                              {score}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">1 = Not at all → 5 = Absolutely</p>
                        {storyBuilderData.storyTest.strangerCareScore && storyBuilderData.storyTest.strangerCareScore < 4 && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              <span><strong>Coach tip:</strong> Your story needs more tension or emotional stakes. What's at risk? What makes this matter?</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Test 2: Simple Enough */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                          <Label className="font-medium">Is the story simple enough to repeat?</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Others should be able to retell it without losing impact.
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <Button
                              key={score}
                              size="sm"
                              variant={storyBuilderData.storyTest.simplicityScore === score ? "default" : "outline"}
                              onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, simplicityScore: score }}))}
                              className={`w-10 h-10 ${storyBuilderData.storyTest.simplicityScore === score ? (score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-500') : ''}`}
                              data-testid={`button-simplicity-score-${score}`}
                            >
                              {score}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">1 = Too complex → 5 = Crystal clear</p>
                        {storyBuilderData.storyTest.simplicityScore && storyBuilderData.storyTest.simplicityScore < 4 && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              <span><strong>Coach tip:</strong> Simplify! Cut unnecessary details. Focus on one hero, one challenge, one transformation.</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Test 3: Leadership Values */}
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                          <Label className="font-medium">Does it reveal something meaningful about leadership, judgment, or values?</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          If yes — it's a leader's story.
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <Button
                              key={score}
                              size="sm"
                              variant={storyBuilderData.storyTest.leadershipValuesScore === score ? "default" : "outline"}
                              onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, leadershipValuesScore: score }}))}
                              className={`w-10 h-10 ${storyBuilderData.storyTest.leadershipValuesScore === score ? (score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-500') : ''}`}
                              data-testid={`button-leadership-score-${score}`}
                            >
                              {score}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">1 = No insight → 5 = Powerful lesson</p>
                        {storyBuilderData.storyTest.leadershipValuesScore && storyBuilderData.storyTest.leadershipValuesScore < 4 && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              <span><strong>Coach tip:</strong> Make the leadership insight explicit. What decision did they face? What value guided them?</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="p-4 rounded-lg border bg-card">
                        <Label className="font-medium mb-2 block">Test Notes</Label>
                        <Textarea
                          placeholder="Notes on how to improve your story based on the test results..."
                          value={storyBuilderData.storyTest.testNotes}
                          onChange={(e) => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, testNotes: e.target.value }}))}
                          className="min-h-[60px] text-sm"
                          data-testid="input-test-notes"
                        />
                      </div>
                    </div>

                    {/* Overall Score Summary */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-700">Story Readiness</h4>
                        </div>
                        {(() => {
                          const scores = [
                            storyBuilderData.storyTest.strangerCareScore,
                            storyBuilderData.storyTest.simplicityScore,
                            storyBuilderData.storyTest.leadershipValuesScore
                          ].filter(s => s !== null) as number[];
                          if (scores.length === 0) return null;
                          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                          const color = avg >= 4 ? "emerald" : avg >= 3 ? "amber" : "red";
                          return (
                            <Badge className={`bg-${color}-500 text-white`}>
                              {avg >= 4 ? "Ready to Tell" : avg >= 3 ? "Almost There" : "Needs Work"}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-white/50">
                          <p className="text-2xl font-bold text-purple-700">{storyBuilderData.storyTest.strangerCareScore ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">Stranger Care</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50">
                          <p className="text-2xl font-bold text-purple-700">{storyBuilderData.storyTest.simplicityScore ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">Simplicity</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50">
                          <p className="text-2xl font-bold text-purple-700">{storyBuilderData.storyTest.leadershipValuesScore ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">Leadership</p>
                        </div>
                      </div>
                      {/* Practice with Yoodli */}
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                          onClick={() => {
                            window.open("https://yoodli.ai", "_blank");
                            toast({ 
                              title: "Opening Yoodli", 
                              description: "Practice your story delivery with AI speech coaching" 
                            });
                          }}
                          data-testid="button-practice-yoodli-inline"
                        >
                          <Mic className="w-4 h-4" />
                          Practice with Yoodli
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            {/* Navigation */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setDiscoveryStep("intelligence")} data-testid="button-back-to-intelligence">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Intelligence
              </Button>
              <Button 
                onClick={() => {
                  setDiscoveryCompleted(true);
                  setDiscoveryStep("insights");
                }} 
                data-testid="button-next-to-insights"
              >
                Complete Discovery
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
          );
        })()} {/* End of Step 3: Questions/Discovery Toolkit */}

        {/* Step 4: Discovery Summary & Coaching - AI-Powered Strategic Insights */}
        {discoveryStep === "insights" && <DiscoverySummaryStep 
          projectId={projectId}
          project={project}
          themeName={selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name || "General" : "General"}
          onBackToQuestions={() => setDiscoveryStep("questions")}
          onStartNewDiscovery={() => {
            setDiscoveryStep("theme-select");
            setSelectedDiscoveryTheme(null);
            setSelectedQuestions(new Set());
            setQuestionAnswers({});
            setDiscoveryCompleted(false);
            setMyCallFlow([]);
          }}
          onContinueToBuildValue={() => setActiveTab("align")}
        />}
      </TabsContent>

          {/* STAGE 2: OUTCOMES & ALIGNMENT - Unified Design + Client Collaboration */}
          <TabsContent value="align" className="space-y-6">
            {/* Unified Header with Sharing Controls */}
            <Card className="bg-gradient-to-r from-purple-500/5 via-primary/5 to-blue-500/5 border-purple-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Outcomes & Alignment
                        <Badge className="bg-blue-500/10 text-blue-600 text-xs">Shareable</Badge>
                      </CardTitle>
                      <CardDescription>
                        Design value outcomes and share with your client for collaborative confirmation
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-purple-500/10 text-purple-600">
                      {commitments.length} Outcome{commitments.length !== 1 ? 's' : ''}
                    </Badge>
                    {commitments.filter((c: any) => c.status === "client_confirmed").length > 0 && (
                      <Badge className="bg-emerald-500/10 text-emerald-600">
                        {commitments.filter((c: any) => c.status === "client_confirmed").length} Confirmed
                      </Badge>
                    )}
                    {commitments.filter((c: any) => c.status === "draft").length > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        {commitments.filter((c: any) => c.status === "draft").length} Draft
                      </Badge>
                    )}
                    <div className="h-4 w-px bg-border mx-1" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await apiRequest("POST", `/api/projects/${projectId}/portal/share`, {
                            portalTitle: `${project?.companyName} Collaboration Portal`,
                            welcomeMessage: `Welcome to your strategic collaboration portal. Review the proposed strategies and outcomes, and share your feedback.`,
                            portalSections: { overview: true, strategies: true, outcomes: true, progress: true },
                          });
                          const data = await response.json();
                          if (data.shareUrl) {
                            const fullUrl = `${window.location.origin}${data.shareUrl}`;
                            await navigator.clipboard.writeText(fullUrl);
                            toast({ 
                              title: "Link Copied!", 
                              description: "Client portal link has been copied to your clipboard." 
                            });
                          }
                        } catch (error) {
                          toast({ 
                            variant: "destructive",
                            title: "Failed to generate link", 
                            description: "Please try again." 
                          });
                        }
                      }}
                      data-testid="btn-copy-client-link"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Copy Client Link
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Sub-navigation for sections */}
            <div className="flex items-center gap-2 border-b pb-4">
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
                {confirmedCommitments.map((c: any) => {
                  const journeyTemplate = c.solutionPattern ? OUTCOME_JOURNEY_TEMPLATES[c.solutionPattern as SolutionPatternId] : null;
                  return (
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
                          <div className="flex-1">
                            <h4 className="font-semibold">{c.name}</h4>
                            
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {c.solutionPattern && SOLUTION_VALUE_PATTERNS[c.solutionPattern as SolutionPatternId] && (
                                <Badge variant="outline" className="text-xs border-dashed">
                                  {SOLUTION_VALUE_PATTERNS[c.solutionPattern as SolutionPatternId].name}
                                </Badge>
                              )}
                              {c.valuePillar && VALUE_PILLARS[c.valuePillar as ValuePillarId] && (
                                <Badge className={`text-xs ${
                                  c.valuePillar === 'grow' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                                  c.valuePillar === 'optimise' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                                  c.valuePillar === 'derisk' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                                  'bg-violet-500/10 text-violet-600 border-violet-500/30'
                                } border`}>
                                  {VALUE_PILLARS[c.valuePillar as ValuePillarId].name}
                                </Badge>
                              )}
                              {(c.implementationTimeline || journeyTemplate?.typicalTimeline) && (
                                <Badge variant="outline" className="text-[10px] border-dashed">
                                  <Calendar className="w-3 h-3 mr-0.5" />
                                  {c.implementationTimeline || journeyTemplate?.typicalTimeline}
                                </Badge>
                              )}
                            </div>
                            
                            {c.outcomeStatement && (
                              <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded mt-2 border border-emerald-200">
                                <strong>Success:</strong> {c.outcomeStatement}
                              </div>
                            )}
                            
                            {c.description && (
                              <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
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
                            
                            {journeyTemplate && (
                              <div className="mt-3 pt-3 border-t border-dashed">
                                <div className="flex items-center gap-2 mb-2">
                                  <Layers className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs font-medium">Delivery Roadmap</span>
                                </div>
                                <div className="flex gap-1 items-center">
                                  {journeyTemplate.phases.map((phase, idx) => (
                                    <div key={idx} className="flex items-center">
                                      <div className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                        {phase.phase}
                                      </div>
                                      {idx < journeyTemplate.phases.length - 1 && (
                                        <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {journeyTemplate.quickWins.length} quick wins • {journeyTemplate.milestones.length} key milestones
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge className="bg-emerald-500/10 text-emerald-600">Confirmed</Badge>
                          {c.estimatedAnnualValue && (
                            <p className="text-lg font-bold text-emerald-600 mt-2">
                              ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* Add/Edit Attendee Dialog for Multiple Attendees Mode */}
      <Dialog open={showAddAttendeeDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingAttendee(null);
        }
        setShowAddAttendeeDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-emerald-600" />
              {editingAttendee ? "Edit Attendee" : "Add Meeting Attendee"}
            </DialogTitle>
            <DialogDescription>
              Add stakeholder details to generate a comprehensive meeting story.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Name *</Label>
                <Input
                  placeholder="e.g., Sarah Chen"
                  value={editingAttendee?.name || ""}
                  onChange={(e) => setEditingAttendee(prev => prev ? { ...prev, name: e.target.value } : { id: `temp-${Date.now()}`, name: e.target.value, title: "", role: undefined, influence: undefined, knownConcerns: "", personalRapport: "" })}
                  className="h-9"
                  data-testid="input-attendee-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  placeholder="e.g., VP of People"
                  value={editingAttendee?.title || ""}
                  onChange={(e) => setEditingAttendee(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="h-9"
                  data-testid="input-attendee-title"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Buying Role</Label>
                <Select
                  value={editingAttendee?.role || undefined}
                  onValueChange={(v) => setEditingAttendee(prev => prev ? { ...prev, role: v as any } : null)}
                >
                  <SelectTrigger className="h-9" data-testid="select-attendee-role">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economic_buyer">Economic Buyer</SelectItem>
                    <SelectItem value="user_buyer">User Buyer</SelectItem>
                    <SelectItem value="technical_buyer">Technical Buyer</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="champion">Champion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Influence Level</Label>
                <Select
                  value={editingAttendee?.influence || undefined}
                  onValueChange={(v) => setEditingAttendee(prev => prev ? { ...prev, influence: v as any } : null)}
                >
                  <SelectTrigger className="h-9" data-testid="select-attendee-influence">
                    <SelectValue placeholder="Influence..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Key Decision Maker</SelectItem>
                    <SelectItem value="medium">Medium - Strong Influencer</SelectItem>
                    <SelectItem value="low">Low - Stakeholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Known Concerns / Priorities</Label>
              <Textarea
                placeholder="What do you know about their current challenges?"
                value={editingAttendee?.knownConcerns || ""}
                onChange={(e) => setEditingAttendee(prev => prev ? { ...prev, knownConcerns: e.target.value } : null)}
                className="min-h-[60px] text-sm"
                data-testid="input-attendee-concerns"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setEditingAttendee(null);
              setShowAddAttendeeDialog(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingAttendee?.name) {
                  const indexMatch = editingAttendee.id?.match(/^idx-(\d+)$/);
                  if (indexMatch) {
                    const existingIndex = parseInt(indexMatch[1], 10);
                    setMeetingAttendees(prev => prev.map((a, i) => i === existingIndex ? { ...editingAttendee, id: undefined } : a));
                  } else {
                    setMeetingAttendees(prev => [...prev, { ...editingAttendee, id: undefined }]);
                  }
                  setEditingAttendee(null);
                  setShowAddAttendeeDialog(false);
                }
              }}
              disabled={!editingAttendee?.name}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-save-attendee"
            >
              <CheckCircle className="w-4 h-4" />
              {editingAttendee?.id?.startsWith("idx-") ? "Update Attendee" : "Add Attendee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tension Questions Dialog - AI recommendations with methodology tags */}
      <Dialog open={tensionQuestionsDialogOpen} onOpenChange={setTensionQuestionsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Story Questions Coach
            </DialogTitle>
            <DialogDescription>
              Get AI-recommended questions tailored to {meetingContact.name || "your contact"} and your discovery themes. 
              Questions are tagged by sales methodology for strategic impact.
            </DialogDescription>
          </DialogHeader>
          
          {/* Context Summary */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{meetingContact.name || "Contact"}</span>
                  {meetingContact.title && <span className="text-muted-foreground"> • {meetingContact.title}</span>}
                  {meetingContact.role && (
                    <Badge variant="outline" className="ml-2 text-[10px] capitalize">
                      {meetingContact.role.replace("_", " ")}
                    </Badge>
                  )}
                </p>
                {selectedDiscoveryTheme && (
                  <p className="text-xs text-muted-foreground mt-1">Theme: {selectedDiscoveryTheme}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGenerateTensionQuestions}
              disabled={tensionQuestionsLoading}
              className="gap-2"
              data-testid="button-generate-tension-questions"
            >
              {tensionQuestionsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Questions
                </>
              )}
            </Button>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/30">SPIN</Badge>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700 border-purple-500/30">Miller Heiman</Badge>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30">PSS</Badge>
            </div>
          </div>
          
          {/* AI-Generated Questions */}
          {suggestedTensionQuestions.length > 0 && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select questions to add:</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const allSelected = suggestedTensionQuestions.every(q => q.selected);
                    setSuggestedTensionQuestions(prev => prev.map(q => ({ ...q, selected: !allSelected })));
                  }}
                >
                  {suggestedTensionQuestions.every(q => q.selected) ? "Deselect All" : "Select All"}
                </Button>
              </div>
              {suggestedTensionQuestions.map((question) => (
                <div 
                  key={question.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    question.selected ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card hover-elevate"
                  }`}
                  onClick={() => {
                    setSuggestedTensionQuestions(prev => prev.map(q => 
                      q.id === question.id ? { ...q, selected: !q.selected } : q
                    ));
                  }}
                  data-testid={`question-option-${question.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                      question.selected ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                    }`}>
                      {question.selected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            question.methodology === "SPIN" ? "bg-blue-500/10 text-blue-700 border-blue-500/30" :
                            question.methodology === "MILLER_HEIMAN" ? "bg-purple-500/10 text-purple-700 border-purple-500/30" :
                            "bg-amber-500/10 text-amber-700 border-amber-500/30"
                          }`}
                        >
                          {question.methodology === "MILLER_HEIMAN" ? "Miller Heiman" : question.methodology}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{question.stage}</span>
                      </div>
                      <p className="text-sm font-medium">{question.question}</p>
                      {question.outcome && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="text-emerald-600">Uncovers:</span> {question.outcome}
                        </p>
                      )}
                      {question.followUp && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="text-blue-600">Follow-up:</span> {question.followUp}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Custom Question Input */}
          <div className="pt-3 border-t">
            <Label className="text-sm font-medium mb-2 block">Add your own question:</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a custom question..."
                value={customQuestionText}
                onChange={(e) => setCustomQuestionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customQuestionText.trim()) {
                    handleAddCustomQuestion();
                  }
                }}
                className="flex-1"
                data-testid="input-custom-question"
              />
              <Button
                variant="outline"
                onClick={handleAddCustomQuestion}
                disabled={!customQuestionText.trim()}
                data-testid="button-add-custom-question"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setTensionQuestionsDialogOpen(false);
              setSuggestedTensionQuestions([]);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSelectedQuestions}
              disabled={!suggestedTensionQuestions.some(q => q.selected)}
              className="gap-2"
              data-testid="button-confirm-add-questions"
            >
              <Check className="w-4 h-4" />
              Add {suggestedTensionQuestions.filter(q => q.selected).length} Question{suggestedTensionQuestions.filter(q => q.selected).length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interactive Story Builder Dialog */}
      <Dialog open={storyBuilderOpen} onOpenChange={setStoryBuilderOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Interactive Story Builder
                </DialogTitle>
                <DialogDescription>
                  Craft compelling stories that connect with {meetingContact.name || "your audience"} using a proven 3-phase framework
                </DialogDescription>
              </div>
              {storyBuilderLastSaved && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {storyBuilderLastSaved}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Phase Navigation */}
          <div className="flex gap-2 border-b pb-3">
            {[
              { id: "before" as const, label: "1. BEFORE", subtitle: "Craft", icon: Lightbulb, color: "bg-amber-500" },
              { id: "during" as const, label: "2. DURING", subtitle: "Tell", icon: MessageCircle, color: "bg-blue-500" },
              { id: "after" as const, label: "3. AFTER", subtitle: "Land", icon: Target, color: "bg-green-500" },
              { id: "test" as const, label: "TEST", subtitle: "Validate", icon: CheckCircle, color: "bg-purple-500" }
            ].map((phase, idx) => (
              <Button
                key={phase.id}
                variant={activeStoryPhase === phase.id ? "default" : "outline"}
                className={`flex-1 flex-col h-auto py-2 gap-0.5 ${activeStoryPhase === phase.id ? phase.color : ""}`}
                onClick={() => setActiveStoryPhase(phase.id)}
                data-testid={`button-story-phase-${phase.id}`}
              >
                <div className="flex items-center gap-1.5">
                  <phase.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{phase.label}</span>
                </div>
                <span className="text-[10px] opacity-70">{phase.subtitle}</span>
              </Button>
            ))}
          </div>

          {/* BEFORE Phase - Crafting the Story */}
          {activeStoryPhase === "before" && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900">Crafting Your Story</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Before you tell your story, you need to know exactly what you want to communicate and why it matters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Single Message */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">1</span>
                      What's the single (provocative) message?
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setAiSuggestionLoading("singleMessage");
                        storySuggestionMutation.mutate({ fieldToSuggest: "singleMessage", phase: "before" });
                      }}
                      disabled={aiSuggestionLoading === "singleMessage"}
                      data-testid="button-ai-suggest-message"
                    >
                      {aiSuggestionLoading === "singleMessage" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    placeholder="What is the one idea you need them to remember? Express it in one sentence..."
                    value={storyBuilderData.before.singleMessage}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, singleMessage: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-single-message"
                  />
                  <p className="text-xs text-muted-foreground">Tip: If you can't say it in one sentence, you haven't found your message yet.</p>
                </div>

                {/* Emotional Reaction */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">2</span>
                      What emotional reaction do I seek?
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Momentum", "Urgency", "Hope", "Resolve", "Curiosity", "Concern", "Excitement", "Determination"].map((emotion) => (
                      <Button
                        key={emotion}
                        size="sm"
                        variant={storyBuilderData.before.emotionalReaction === emotion.toLowerCase() ? "default" : "outline"}
                        className={`h-8 text-xs ${storyBuilderData.before.emotionalReaction === emotion.toLowerCase() ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                        onClick={() => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, emotionalReaction: emotion.toLowerCase() } }))}
                        data-testid={`button-emotion-${emotion.toLowerCase()}`}
                      >
                        {emotion}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="What should they feel? What is at stake in this story?"
                    value={storyBuilderData.before.emotionalReaction.includes(" ") ? storyBuilderData.before.emotionalReaction : ""}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, emotionalReaction: e.target.value } }))}
                    className="min-h-[40px] text-sm"
                    data-testid="input-emotional-detail"
                  />
                </div>

                {/* Story Structure */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">3</span>
                    Story Structure
                  </Label>
                  <Select
                    value={storyBuilderData.before.storyStructure}
                    onValueChange={(v) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, storyStructure: v } }))}
                  >
                    <SelectTrigger data-testid="select-story-structure">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="situation-struggle-insight-outcome">Situation → Struggle → Insight → Outcome</SelectItem>
                      <SelectItem value="problem-agitate-solve">Problem → Agitate → Solve</SelectItem>
                      <SelectItem value="hero-journey">Hero's Journey (Challenge → Transformation → Victory)</SelectItem>
                      <SelectItem value="before-after-bridge">Before → After → Bridge</SelectItem>
                      <SelectItem value="star-chain-hook">Star → Chain → Hook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Starting Hook */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">4</span>
                      What's the right starting hook?
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setAiSuggestionLoading("startingHook");
                        storySuggestionMutation.mutate({ fieldToSuggest: "startingHook", phase: "before" });
                      }}
                      disabled={aiSuggestionLoading === "startingHook"}
                      data-testid="button-ai-suggest-hook"
                    >
                      {aiSuggestionLoading === "startingHook" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    placeholder="A moment of high tension? A provocative question? A vivid scene ('Picture this...')? A surprising fact or reversal?"
                    value={storyBuilderData.before.startingHook}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, startingHook: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-starting-hook"
                  />
                </div>

                {/* Hero Character */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">5</span>
                    Who's the hero? Identify the characters
                  </Label>
                  <Textarea
                    placeholder="How are they involved? What were their motivations or concerns? How did they change?"
                    value={storyBuilderData.before.heroCharacter}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, heroCharacter: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-hero-character"
                  />
                </div>

                {/* Evidence */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">6</span>
                    What evidence will you reference to build trust?
                  </Label>
                  <Textarea
                    placeholder="Data points, metrics, case studies, third-party validation..."
                    value={storyBuilderData.before.evidenceToReference}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, evidenceToReference: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-evidence"
                  />
                </div>

                {/* Tension Questions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">7</span>
                      What questions keep the story moving?
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTensionQuestionsDialogOpen(true)}
                      className="h-7 gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                  {storyBuilderData.before.tensionQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Click Add to get AI-recommended questions</p>
                  ) : (
                    <div className="space-y-2">
                      {storyBuilderData.before.tensionQuestions.map((q, i) => (
                        <div key={q.id} className="p-2 border rounded text-sm">
                          <p className="font-medium">{q.prompt}</p>
                          {q.response && <p className="text-muted-foreground mt-1">{q.response}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setActiveStoryPhase("during")} className="gap-2" data-testid="button-next-to-during">
                  Continue to Telling
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* DURING Phase - Telling the Story */}
          {activeStoryPhase === "during" && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Telling Your Story</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Now you're in the room. Delivery matters as much as content. Pace it like a movie.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Opening Line */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                      Start fast — no preamble
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setAiSuggestionLoading("openingLine");
                        storySuggestionMutation.mutate({ fieldToSuggest: "openingLine", phase: "during" });
                      }}
                      disabled={aiSuggestionLoading === "openingLine"}
                      data-testid="button-ai-suggest-opening"
                    >
                      {aiSuggestionLoading === "openingLine" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter the story at the moment of action. Your opening line..."
                    value={storyBuilderData.during.openingLine}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, openingLine: e.target.value } }))}
                    className="min-h-[80px]"
                    data-testid="input-opening-line"
                  />
                  <p className="text-xs text-muted-foreground">Coach: Short sentences in moments of tension. Longer sentences in reflection.</p>
                </div>

                {/* Turning Point */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                    Show the turning point
                  </Label>
                  <Textarea
                    placeholder="What realization changed the course? Why did that moment matter?"
                    value={storyBuilderData.during.turningPoint}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, turningPoint: e.target.value } }))}
                    className="min-h-[80px]"
                    data-testid="input-turning-point"
                  />
                </div>

                {/* Key Data Points */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                    Key data points (don't over-explain)
                  </Label>
                  <Textarea
                    placeholder="Use the 'story spine' to bring meaning; data becomes supporting evidence after the story..."
                    value={storyBuilderData.during.keyDataPoints}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, keyDataPoints: e.target.value } }))}
                    className="min-h-[80px]"
                    data-testid="input-key-data"
                  />
                </div>

                {/* Pacing Notes */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</span>
                    Pacing & pause notes
                  </Label>
                  <Textarea
                    placeholder="Where will you pause strategically? What parts need emphasis? Keep it conversational - speak like a human."
                    value={storyBuilderData.during.pacingNotes}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, during: { ...prev.during, pacingNotes: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-pacing"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStoryPhase("before")} className="gap-2" data-testid="button-back-to-before">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Crafting
                </Button>
                <Button onClick={() => setActiveStoryPhase("after")} className="gap-2" data-testid="button-next-to-after">
                  Continue to Landing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* AFTER Phase - Landing the Story */}
          {activeStoryPhase === "after" && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">Landing Your Story</p>
                    <p className="text-sm text-green-700 mt-1">
                      The ending determines what they remember. Make it count.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Moment of Meaning */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">1</span>
                      Finish with a "moment of meaning"
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setAiSuggestionLoading("momentOfMeaning");
                        storySuggestionMutation.mutate({ fieldToSuggest: "meaningMoment", phase: "after" });
                      }}
                      disabled={aiSuggestionLoading === "momentOfMeaning"}
                      data-testid="button-ai-suggest-meaning"
                    >
                      {aiSuggestionLoading === "momentOfMeaning" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    placeholder="A crisp insight. A forward-looking question. A short reflective conclusion..."
                    value={storyBuilderData.after.momentOfMeaning}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, after: { ...prev.after, momentOfMeaning: e.target.value } }))}
                    className="min-h-[80px]"
                    data-testid="input-moment-meaning"
                  />
                </div>

                {/* Explicit Takeaway */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</span>
                    Make the takeaway explicit — but not obvious
                  </Label>
                  <Textarea
                    placeholder="Connect story → action. What do you want them to do with this insight?"
                    value={storyBuilderData.after.explicitTakeaway}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, after: { ...prev.after, explicitTakeaway: e.target.value } }))}
                    className="min-h-[80px]"
                    data-testid="input-takeaway"
                  />
                </div>

                {/* Call to Action */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">3</span>
                    Your call to action
                  </Label>
                  <Textarea
                    placeholder="What specific next step do you want from them?"
                    value={storyBuilderData.after.callToAction}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, after: { ...prev.after, callToAction: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-call-to-action"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStoryPhase("during")} className="gap-2" data-testid="button-back-to-during">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Telling
                </Button>
                <Button onClick={() => setActiveStoryPhase("test")} className="gap-2 bg-purple-500 hover:bg-purple-600" data-testid="button-test-story">
                  Test Your Story
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* TEST Phase - Story Validation */}
          {activeStoryPhase === "test" && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-purple-900">Test Your Story</p>
                    <p className="text-sm text-purple-700 mt-1">
                      Before you tell it, run these three tests. If it doesn't pass, go back and sharpen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Test 1: Stranger Care */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">1</span>
                      Would a stranger care?
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Button
                          key={score}
                          size="sm"
                          variant={storyBuilderData.storyTest.strangerCareScore === score ? "default" : "outline"}
                          className={`w-8 h-8 p-0 ${storyBuilderData.storyTest.strangerCareScore === score ? "bg-purple-500" : ""}`}
                          onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, strangerCareScore: score } }))}
                          data-testid={`button-stranger-score-${score}`}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If a stranger heard this story, would they lean in or tune out? If not, sharpen the tension or emotional core.
                  </p>
                  {storyBuilderData.storyTest.strangerCareScore !== null && storyBuilderData.storyTest.strangerCareScore < 3 && (
                    <div className="p-2 rounded bg-amber-500/10 text-amber-800 text-sm">
                      <span className="font-medium">Coach:</span> Try adding more specific stakes or a stronger hook. What would make someone stop scrolling?
                    </div>
                  )}
                </div>

                {/* Test 2: Simplicity */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">2</span>
                      Is the story simple enough to repeat?
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Button
                          key={score}
                          size="sm"
                          variant={storyBuilderData.storyTest.simplicityScore === score ? "default" : "outline"}
                          className={`w-8 h-8 p-0 ${storyBuilderData.storyTest.simplicityScore === score ? "bg-purple-500" : ""}`}
                          onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, simplicityScore: score } }))}
                          data-testid={`button-simplicity-score-${score}`}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Others should be able to retell it without losing impact. Can they say it in 30 seconds?
                  </p>
                  {storyBuilderData.storyTest.simplicityScore !== null && storyBuilderData.storyTest.simplicityScore < 3 && (
                    <div className="p-2 rounded bg-amber-500/10 text-amber-800 text-sm">
                      <span className="font-medium">Coach:</span> Simplify. Cut details that don't serve the main message. One story, one point.
                    </div>
                  )}
                </div>

                {/* Test 3: Leadership Values */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">3</span>
                      Does it reveal something meaningful about leadership, judgment, or values?
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Button
                          key={score}
                          size="sm"
                          variant={storyBuilderData.storyTest.leadershipValuesScore === score ? "default" : "outline"}
                          className={`w-8 h-8 p-0 ${storyBuilderData.storyTest.leadershipValuesScore === score ? "bg-purple-500" : ""}`}
                          onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, leadershipValuesScore: score } }))}
                          data-testid={`button-leadership-score-${score}`}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If yes — it's a leader's story. It shows character, not just competence.
                  </p>
                  {storyBuilderData.storyTest.leadershipValuesScore !== null && storyBuilderData.storyTest.leadershipValuesScore < 3 && (
                    <div className="p-2 rounded bg-amber-500/10 text-amber-800 text-sm">
                      <span className="font-medium">Coach:</span> Add a moment of decision or conflict that reveals character. What choice did someone make?
                    </div>
                  )}
                </div>

                {/* Story Readiness Score */}
                <div className="p-4 rounded-lg border-2 border-purple-500/30 bg-purple-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold text-base">Story Readiness</Label>
                    {(() => {
                      const scores = [
                        storyBuilderData.storyTest.strangerCareScore,
                        storyBuilderData.storyTest.simplicityScore,
                        storyBuilderData.storyTest.leadershipValuesScore
                      ].filter((s): s is number => s !== null);
                      if (scores.length === 0) return <Badge variant="outline">Not tested yet</Badge>;
                      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                      if (avg >= 4) return <Badge className="bg-green-500">Ready to tell!</Badge>;
                      if (avg >= 3) return <Badge className="bg-amber-500">Almost there</Badge>;
                      return <Badge className="bg-red-500">Needs work</Badge>;
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: "Engagement", score: storyBuilderData.storyTest.strangerCareScore },
                      { label: "Simplicity", score: storyBuilderData.storyTest.simplicityScore },
                      { label: "Values", score: storyBuilderData.storyTest.leadershipValuesScore }
                    ].map((item) => (
                      <div key={item.label} className="flex-1 text-center p-2 rounded bg-white/50">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-bold">{item.score ?? "—"}<span className="text-xs font-normal text-muted-foreground">/5</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Notes */}
                <div className="space-y-2">
                  <Label>Notes for improvement</Label>
                  <Textarea
                    placeholder="What will you change before telling this story?"
                    value={storyBuilderData.storyTest.testNotes}
                    onChange={(e) => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, testNotes: e.target.value } }))}
                    className="min-h-[60px]"
                    data-testid="input-test-notes"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStoryPhase("after")} className="gap-2" data-testid="button-back-to-after">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Landing
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                    onClick={() => {
                      window.open("https://yoodli.ai", "_blank");
                      toast({ 
                        title: "Opening Yoodli", 
                        description: "Practice your story delivery with AI speech coaching" 
                      });
                    }}
                    data-testid="button-practice-yoodli"
                  >
                    <Mic className="w-4 h-4" />
                    Practice with Yoodli
                  </Button>
                  <Button onClick={() => setStoryBuilderOpen(false)} className="gap-2" data-testid="button-close-story-builder">
                    <CheckCircle className="w-4 h-4" />
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI Reasoning Display */}
          {aiSuggestionReasoning && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-purple-700">AI Coaching Insight</p>
                  <p className="text-sm text-muted-foreground mt-1">{aiSuggestionReasoning}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Voice Command System */}
      <FloatingVoiceButton 
        onClick={() => setIsVoiceCommandOpen(true)} 
        isActive={isVoiceCommandOpen}
      />
      
      <VoiceCommandOverlay
        isOpen={isVoiceCommandOpen}
        onClose={() => setIsVoiceCommandOpen(false)}
        onTranscript={handleVoiceTranscript}
        currentPhase={activeStoryPhase}
        availableFields={voiceCommandFields}
        activeField={voiceTargetField}
      />
    </div>
  );
}
