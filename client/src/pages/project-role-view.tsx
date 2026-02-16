import { useState, useEffect, useCallback, useRef } from "react";
import { SiLinkedin } from "react-icons/si";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  XCircle,
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
  ArrowRightCircle,
  Quote,
  Upload,
  GitBranch,
  ThumbsUp,
  Package,
  Filter,
  Crown,
  Rocket,
  Presentation
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
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
import { JourneyLoopVisualizer } from "@/components/JourneyLoopVisualizer";
import { UnifiedJourneyTimeline } from "@/components/UnifiedJourneyTimeline";
import CompetitiveIntelligence from "@/components/CompetitiveIntelligence";
import { StrategicAlignmentSelector } from "@/components/StrategicAlignmentSelector";
import { JOURNEY_LOOP_STAGES, UNIFIED_JOURNEY_PHASES, createUnifiedJourney } from "@shared/value-frameworks";
import { VoiceCommandOverlay, FloatingVoiceButton } from "@/components/VoiceCommandOverlay";
import { InlineEditableBaseline } from "@/components/InlineEditableField";
import { ValueWithProvenance } from "@/components/value-calculation-breakdown";
import { ArtifactUpload } from "@/components/ArtifactUpload";
import { PostMeetingQuestionAnswers } from "@/components/PostMeetingQuestionAnswers";
import { ArtifactLibrary } from "@/components/ArtifactLibrary";
import { ExportOptionsDialog } from "@/components/ExportOptionsDialog";
import { ExportButton } from "@/components/ExportButton";
import { InteractiveTimeline } from "@/components/InteractiveTimeline";
import { StoryCoach } from "@/components/StoryCoach";
import { GrowthAcceleratorCanvas } from "@/components/GrowthAcceleratorCanvas";
import { 
  generateIntelligencePPT, 
  generateIntelligencePDF,
  generateOutcomesPPT,
  generateOutcomesPDF,
  generateCoachingPPT,
  generateCoachingPDF,
  type IntelligenceExportData,
  type OutcomeExportData,
  type CoachingExportData,
} from "@/lib/exportService";

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
  label: string;
  value: string;
  confidence: string | null;
  source: string | null;
  priorityScore: number | null;
  kornFerryPillar: string | null;
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

// Meeting Insights types for the Summary section
type MeetingInsightsData = {
  attendees: Array<{
    name: string;
    title: string;
    affiliation: "client" | "internal";
    role: string;
    influence?: string;
    aiResearch?: {
      roleContext?: string;
      keyPriorities?: string[];
      rapportBuildingTips?: string[];
      storyAngle?: string;
      researchedAt?: string;
    };
  }>;
  transcriptAnalysis?: {
    summary: string;
    keyInsights: string[];
    actionItems: Array<{ item: string; owner: string; dueDate?: string }>;
    stakeholderSentiment: Record<string, { sentiment: string; signals: string[] }>;
    coachingNotes: Array<{ area: string; observation: string; suggestion: string }>;
    followUpQuestions: string[];
    analyzedAt: string;
  } | null;
  greenSheetContext?: {
    objective: string;
    desiredOutcome: string;
    openingStatement: string;
    bestActionCommitment: string;
  };
};

// Story Strength Summary Widget - mirrors StoryCoach calculation
function StoryStrengthSummaryWidget({ 
  storyBuilderData,
  storyRefineResult
}: { 
  storyBuilderData: {
    before: { singleMessage: string; startingHook: string; heroCharacter: string };
    during: { openingLine: string; turningPoint: string };
    after: { momentOfMeaning: string; callToAction: string };
    storyTest: { strangerCareScore: number | null; simplicityScore: number | null; leadershipValuesScore: number | null };
  };
  storyRefineResult: { overallScore: number; overallFeedback: string; improvements: Array<{ element: string; suggestion: string }> } | null;
}) {
  const checkStrength = (value: string, minLength = 10): "empty" | "draft" | "strong" => {
    if (!value) return "empty";
    if (value.trim().length < minLength) return "draft";
    return "strong";
  };
  
  const storyElements = [
    { id: "singleMessage", label: "Key Message", value: storyBuilderData.before.singleMessage, phase: "before" },
    { id: "startingHook", label: "Opening Hook", value: storyBuilderData.before.startingHook, phase: "before" },
    { id: "heroCharacter", label: "Hero Character", value: storyBuilderData.before.heroCharacter, phase: "before" },
    { id: "openingLine", label: "Opening Line", value: storyBuilderData.during.openingLine, phase: "during" },
    { id: "turningPoint", label: "Turning Point", value: storyBuilderData.during.turningPoint, phase: "during" },
    { id: "momentOfMeaning", label: "Moment of Meaning", value: storyBuilderData.after.momentOfMeaning, phase: "after" },
    { id: "callToAction", label: "Call to Action", value: storyBuilderData.after.callToAction, phase: "after" }
  ];
  
  const strongElements = storyElements.filter(e => checkStrength(e.value) === "strong").length;
  const testScores = [
    storyBuilderData.storyTest.strangerCareScore,
    storyBuilderData.storyTest.simplicityScore,
    storyBuilderData.storyTest.leadershipValuesScore
  ].filter(s => s !== null && s >= 3).length;
  
  const totalPossible = storyElements.length + 3;
  const totalAchieved = strongElements + testScores;
  const storyStrengthPercent = Math.round((totalAchieved / totalPossible) * 100);
  
  const coachingFeedback: string[] = [];
  if (!storyBuilderData.before.singleMessage) coachingFeedback.push("Define your single key message");
  if (!storyBuilderData.before.startingHook) coachingFeedback.push("Create a compelling opening hook");
  if (!storyBuilderData.during.turningPoint) coachingFeedback.push("Identify the pivotal turning point");
  if (!storyBuilderData.after.callToAction) coachingFeedback.push("End with a clear call to action");
  if (testScores < 3) coachingFeedback.push(`Complete ${3 - testScores} more story tests`);
  
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 mt-4" data-testid="card-story-strength-summary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Story Strength</CardTitle>
          </div>
          <Badge className={`${storyStrengthPercent >= 70 ? "bg-emerald-500" : storyStrengthPercent >= 40 ? "bg-amber-500" : "bg-muted"}`}>
            {storyStrengthPercent}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Your narrative preparation for client conversations</p>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress value={storyStrengthPercent} className="h-2 mb-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{strongElements}/{storyElements.length} elements strong</span>
          <span>{testScores}/3 tests passed</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className={`p-2 rounded text-center ${storyElements.filter(e => e.phase === "before" && checkStrength(e.value) === "strong").length >= 2 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/50"}`}>
            <p className="text-[10px] font-medium">BEFORE</p>
            <p className="text-[10px] text-muted-foreground">{storyElements.filter(e => e.phase === "before" && checkStrength(e.value) === "strong").length}/3</p>
          </div>
          <div className={`p-2 rounded text-center ${storyElements.filter(e => e.phase === "during" && checkStrength(e.value) === "strong").length >= 1 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/50"}`}>
            <p className="text-[10px] font-medium">DURING</p>
            <p className="text-[10px] text-muted-foreground">{storyElements.filter(e => e.phase === "during" && checkStrength(e.value) === "strong").length}/2</p>
          </div>
          <div className={`p-2 rounded text-center ${storyElements.filter(e => e.phase === "after" && checkStrength(e.value) === "strong").length >= 1 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/50"}`}>
            <p className="text-[10px] font-medium">AFTER</p>
            <p className="text-[10px] text-muted-foreground">{storyElements.filter(e => e.phase === "after" && checkStrength(e.value) === "strong").length}/2</p>
          </div>
        </div>
        
        {storyRefineResult && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-3">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Coach Feedback</span>
              <Badge className={storyRefineResult.overallScore >= 7 ? "bg-emerald-500" : storyRefineResult.overallScore >= 5 ? "bg-amber-500" : "bg-red-500"}>
                {storyRefineResult.overallScore}/10
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{storyRefineResult.overallFeedback}</p>
            {storyRefineResult.improvements.length > 0 && (
              <div className="mt-2 space-y-1">
                {storyRefineResult.improvements.slice(0, 2).map((imp, i) => (
                  <p key={i} className="text-[10px] text-amber-700 dark:text-amber-400">
                    • <span className="font-medium">{imp.element}:</span> {imp.suggestion}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!storyRefineResult && coachingFeedback.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Next Steps</span>
            </div>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
              {coachingFeedback.slice(0, 3).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        {storyStrengthPercent >= 70 && (
          <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Your story is ready for client conversations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscoverySummaryStep({ 
  projectId, 
  project, 
  themeName,
  onBackToQuestions,
  onStartNewDiscovery,
  onContinueToBuildValue,
  meetingInsights
}: { 
  projectId: number; 
  project: Project;
  themeName: string;
  onBackToQuestions: () => void;
  onStartNewDiscovery: () => void;
  onContinueToBuildValue: () => void;
  meetingInsights?: MeetingInsightsData;
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
              <ExportButton
                label="Export Briefing"
                size="sm"
                onExportPPT={() => {
                  if (!synthesis) return;
                  const exportData: CoachingExportData = {
                    companyName: project?.companyName || "Company",
                    initiativeName: themeName || "Discovery",
                    synthesis: synthesis.executiveSummary,
                    recommendations: synthesis.whatWeLearned?.keyThemes?.map((theme: any) => ({
                      title: theme.theme,
                      description: theme.insight,
                      priority: "high"
                    })) || [],
                    talkingPoints: synthesis.businessImplications?.opportunities?.slice(0, 5).map((o: any) => o.title) || [],
                    nextSteps: synthesis.readinessToBuildValue?.nextSteps || []
                  };
                  generateCoachingPPT(exportData);
                }}
                onExportPDF={() => {
                  if (!synthesis) return;
                  const exportData: CoachingExportData = {
                    companyName: project?.companyName || "Company",
                    initiativeName: themeName || "Discovery",
                    synthesis: synthesis.executiveSummary,
                    recommendations: synthesis.whatWeLearned?.keyThemes?.map((theme: any) => ({
                      title: theme.theme,
                      description: theme.insight,
                      priority: "high"
                    })) || [],
                    talkingPoints: synthesis.businessImplications?.opportunities?.slice(0, 5).map((o: any) => o.title) || [],
                    nextSteps: synthesis.readinessToBuildValue?.nextSteps || []
                  };
                  generateCoachingPDF(exportData);
                }}
              />
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

      {/* Meeting Insights - Visual Summary from Green Sheet */}
      {meetingInsights && (meetingInsights.attendees.length > 0 || meetingInsights.transcriptAnalysis) && (
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" data-testid="card-meeting-insights">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Meeting Insights
              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                From Green Sheet
              </Badge>
            </CardTitle>
            <CardDescription>
              Stakeholder engagement, action items, and coaching observations from your discovery meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Green Sheet Context Summary */}
            {meetingInsights.greenSheetContext && (meetingInsights.greenSheetContext.objective || meetingInsights.greenSheetContext.desiredOutcome) && (
              <div className="p-4 rounded-lg border bg-indigo-50/50 border-indigo-200">
                <h4 className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  Meeting Objectives
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {meetingInsights.greenSheetContext.objective && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Call Objective</p>
                      <p className="text-xs">{meetingInsights.greenSheetContext.objective}</p>
                    </div>
                  )}
                  {meetingInsights.greenSheetContext.desiredOutcome && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Desired Outcome</p>
                      <p className="text-xs">{meetingInsights.greenSheetContext.desiredOutcome}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stakeholder Engagement Grid */}
            {meetingInsights.attendees.filter(a => a.affiliation === "client").length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Stakeholder Engagement
                  <Badge variant="outline" className="text-[10px]">
                    {meetingInsights.attendees.filter(a => a.affiliation === "client").length} Client Contacts
                  </Badge>
                </h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {meetingInsights.attendees.filter(a => a.affiliation === "client").map((attendee, idx) => {
                    const sentiment = meetingInsights.transcriptAnalysis?.stakeholderSentiment?.[attendee.name];
                    const sentimentColor = sentiment?.sentiment === "positive" ? "text-emerald-600 bg-emerald-100" : 
                                           sentiment?.sentiment === "negative" ? "text-red-600 bg-red-100" : 
                                           "text-amber-600 bg-amber-100";
                    return (
                      <div key={idx} className="p-3 rounded-lg border bg-white" data-testid={`insight-attendee-${idx}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-medium">{attendee.name}</p>
                            <p className="text-[10px] text-muted-foreground">{attendee.title}</p>
                          </div>
                          {sentiment && (
                            <Badge className={`text-[10px] ${sentimentColor}`}>
                              {sentiment.sentiment}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mb-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {attendee.role?.replace("_", " ")}
                          </Badge>
                          {attendee.influence && (
                            <Badge variant="outline" className="text-[10px]">
                              {attendee.influence} influence
                            </Badge>
                          )}
                        </div>
                        {attendee.aiResearch?.storyAngle && (
                          <div className="p-2 rounded bg-purple-50 border border-purple-100 mt-2">
                            <p className="text-[10px] text-purple-700 flex items-center gap-1 mb-1">
                              <Lightbulb className="w-2.5 h-2.5" />
                              Story Angle
                            </p>
                            <p className="text-[10px] text-purple-800 leading-relaxed">{attendee.aiResearch.storyAngle}</p>
                          </div>
                        )}
                        {sentiment?.signals && sentiment.signals.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {sentiment.signals.slice(0, 2).map((signal, si) => (
                              <p key={si} className="text-[10px] text-muted-foreground flex items-start gap-1">
                                <span className="text-indigo-500">•</span>
                                {signal}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transcript Analysis Summary */}
            {meetingInsights.transcriptAnalysis && (
              <>
                {/* Key Insights */}
                {meetingInsights.transcriptAnalysis.keyInsights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Key Insights from Meeting
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {meetingInsights.transcriptAnalysis.keyInsights.map((insight, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 flex items-start gap-2" data-testid={`key-insight-${idx}`}>
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-700 flex-shrink-0">{idx + 1}</div>
                          <p className="text-xs">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items with Visual Timeline */}
                {meetingInsights.transcriptAnalysis.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Action Items
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                        {meetingInsights.transcriptAnalysis.actionItems.length} items
                      </Badge>
                    </h4>
                    <div className="space-y-2">
                      {meetingInsights.transcriptAnalysis.actionItems.map((action, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-white flex items-start gap-3" data-testid={`action-item-${idx}`}>
                          <div className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{action.item}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                <User className="w-2.5 h-2.5 mr-0.5" />
                                {action.owner}
                              </Badge>
                              {action.dueDate && (
                                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                                  <Calendar className="w-2.5 h-2.5 mr-0.5" />
                                  {action.dueDate}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coaching Notes as Callout Cards */}
                {meetingInsights.transcriptAnalysis.coachingNotes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Coaching Observations
                    </h4>
                    <div className="space-y-3">
                      {meetingInsights.transcriptAnalysis.coachingNotes.map((note, idx) => (
                        <div key={idx} className="p-4 rounded-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white" data-testid={`coaching-note-${idx}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-700 text-[10px]">{note.area}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">Observation:</span> {note.observation}
                          </p>
                          <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                            <p className="text-xs text-emerald-800 flex items-start gap-1">
                              <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span><span className="font-medium">Suggestion:</span> {note.suggestion}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Questions */}
                {meetingInsights.transcriptAnalysis.followUpQuestions.length > 0 && (
                  <div className="p-4 rounded-lg border bg-amber-50/50 border-amber-200">
                    <h4 className="text-xs font-semibold text-amber-700 mb-3 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Follow-up Questions for Next Meeting
                    </h4>
                    <div className="space-y-1">
                      {meetingInsights.transcriptAnalysis.followUpQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs" data-testid={`followup-question-${idx}`}>
                          <span className="text-amber-600 font-bold">?</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Timestamp */}
                <div className="text-[10px] text-muted-foreground text-right pt-2 border-t">
                  Meeting analyzed: {new Date(meetingInsights.transcriptAnalysis.analyzedAt).toLocaleString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

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
  const [activeLifecycleStage, setActiveLifecycleStage] = useState<string>("onboarding");
  const [evidenceViewMode, setEvidenceViewMode] = useState<"coaching" | "client">("coaching");
  const [isLogKPIOpen, setIsLogKPIOpen] = useState(false);
  const [showHandoffConfirmDialog, setShowHandoffConfirmDialog] = useState(false);
  
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
    annualReportSummary?: {
      fiscalYear: string;
      ceoLetterHighlights: string[];
      strategicPriorities: string[];
      peopleMetrics: {
        headcount?: string;
        turnover?: string;
        diversity?: string;
        engagement?: string;
      };
      riskFactors: string[];
      source: string;
    };
    earningsCallHighlights?: {
      quarter: string;
      executiveCommentary: string[];
      workforceDiscussions: string[];
      futureOutlook: string;
      analystQuestions: string[];
      source: string;
    };
    generatedAt: string;
  }
  
  const [liveIntelligence, setLiveIntelligence] = useState<LiveIntelligenceData | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
  const [intelligenceIsSaved, setIntelligenceIsSaved] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Probe chat state
  const [probeQuestion, setProbeQuestion] = useState("");
  const [probeHistory, setProbeHistory] = useState<Array<{role: "user" | "assistant"; content: string; timestamp: string}>>([]);
  const [isProbing, setIsProbing] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [savedToContext, setSavedToContext] = useState<Set<number>>(new Set());
  const [showContextPrompt, setShowContextPrompt] = useState<number | null>(null);
  const [savingToContext, setSavingToContext] = useState<number | null>(null);
  
  
  // Mutation to probe the intelligence (ask follow-up questions)
  const probeIntelligenceMutation = useMutation({
    mutationFn: async ({ theme, question }: { theme: string; question: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/intelligence/${theme}/probe`, { question });
      return await res.json() as { question: string; answer: string; timestamp: string };
    },
    onSuccess: (data) => {
      const newHistoryLength = probeHistory.length + 2;
      setProbeHistory(prev => [
        ...prev,
        { role: "user" as const, content: data.question, timestamp: data.timestamp },
        { role: "assistant" as const, content: data.answer, timestamp: data.timestamp }
      ]);
      setProbeQuestion("");
      setIsProbing(false);
      // Show context prompt for the new assistant response (index will be newHistoryLength - 1)
      setShowContextPrompt(newHistoryLength - 1);
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

  // Mutation to save probe insight to AI context (appending to discovery notes)
  const saveToContextMutation = useMutation({
    mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
      // First get existing notes
      const existingRes = await fetch(`/api/projects/${projectId}/discovery-notes`);
      const existingNotes = existingRes.ok ? await existingRes.json() : {};
      
      // Create the new insight entry
      const timestamp = new Date().toLocaleString();
      const newInsight = `\n\n---\n📊 **AI Follow-up Insight** (${timestamp})\n**Question:** ${question}\n**Response:** ${answer}`;
      
      // Append to existing freeformNotes
      const updatedNotes = (existingNotes.freeformNotes || "") + newInsight;
      
      const res = await apiRequest("POST", `/api/projects/${projectId}/discovery-notes`, { 
        projectId,
        freeformNotes: updatedNotes,
        keyStakeholder: existingNotes.keyStakeholder || null,
        topChallenges: existingNotes.topChallenges || null,
        timeline: existingNotes.timeline || null
      });
      return await res.json();
    },
    onSuccess: () => {
      const idx = savingToContext;
      if (idx !== null) {
        setSavedToContext(prev => new Set(prev).add(idx));
      }
      setSavingToContext(null);
      setShowContextPrompt(null);
      toast({ 
        title: "Added to AI Context", 
        description: "This insight will be used to enrich future AI coaching and recommendations." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-notes"] });
    },
    onError: () => {
      setSavingToContext(null);
      toast({ 
        title: "Failed to Save", 
        description: "Could not add insight to context. Please try again.", 
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
  type InternalRole = "account_lead" | "delivery_lead" | "consultant" | "subject_expert" | "executive_sponsor";
  type AttendeeRole = BuyingRole | InternalRole;
  type InfluenceLevel = "high" | "medium" | "low";
  type Affiliation = "client" | "internal";
  
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
  
  // AI Research data structure
  type AttendeeResearch = {
    suggestedFullName?: string;
    suggestedTitle?: string;
    roleContext?: string;
    keyPriorities?: string[];
    likelyChallenges?: string[];
    messagingThatResonates?: string[];
    rapportBuildingTips?: string[];
    questionsToAsk?: string[];
    industryContext?: string;
    storyAngle?: string;
    redFlags?: string[];
    researchedAt?: string;
  };

  // Adaptive Meeting Profile state (single vs multiple attendees)
  type MeetingAttendee = {
    id: string;
    name: string;
    title: string;
    affiliation: Affiliation;
    role: AttendeeRole;
    influence?: InfluenceLevel; // Optional - only applicable for client attendees
    knownConcerns: string;
    preferredOutcomes: string;
    personalRapport: string;
    decisionCriteria: string;
    aiResearch?: AttendeeResearch;
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
  const [expandedAttendeeIds, setExpandedAttendeeIds] = useState<Set<string>>(new Set());
  const [isResearchingAttendee, setIsResearchingAttendee] = useState(false);
  const [attendeeResearchResult, setAttendeeResearchResult] = useState<any>(null);
  
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
  
  // Document-based Green Sheet enrichment state
  const [showDocumentEnrichDialog, setShowDocumentEnrichDialog] = useState(false);
  const [documentEnrichmentResult, setDocumentEnrichmentResult] = useState<{
    callPlanner: {
      objective: string;
      desiredOutcome: string;
      openingStatement: string;
      bestActionCommitment: string;
    };
    meetingContact: {
      name: string;
      title: string;
      role: string;
      influence: string;
      knownConcerns: string;
      decisionCriteria: string;
      personalRapport: string;
    };
    sourcedFrom: string[];
  } | null>(null);

  // Document enrichment mutation
  const enrichFromDocumentsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/green-sheet/enrich`, {});
      return response.json();
    },
    onSuccess: (result) => {
      setDocumentEnrichmentResult(result.suggestions);
      setShowDocumentEnrichDialog(true);
      toast({
        title: "Documents analyzed",
        description: `AI analyzed ${result.artifactsAnalyzed} pre-meeting document(s) for Green Sheet suggestions.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Research attendees mutation (AI enrichment)
  const researchAttendeesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/meeting-profile/research-attendees`, {});
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Attendees researched",
        description: `AI researched ${result.participantsResearched} attendee(s) with role context, priorities, and engagement tips.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'meeting-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Research failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Map AI role values to valid BuyingRole enum
  const mapToBuyingRole = (aiRole: string): BuyingRole | null => {
    const normalizedRole = aiRole?.toLowerCase().replace(/[_\s-]/g, "");
    const roleMap: Record<string, BuyingRole> = {
      economicbuyer: "economic_buyer",
      userbuyer: "user_buyer",
      technicalbuyer: "technical_buyer",
      coach: "coach",
      champion: "champion",
      decisionmaker: "economic_buyer",
      influencer: "user_buyer",
      evaluator: "technical_buyer",
      sponsor: "economic_buyer"
    };
    return roleMap[normalizedRole] || null;
  };

  // Map AI influence values to valid InfluenceLevel enum
  const mapToInfluenceLevel = (aiInfluence: string): InfluenceLevel | null => {
    const normalizedInfluence = aiInfluence?.toLowerCase().replace(/[_\s-]/g, "");
    const influenceMap: Record<string, InfluenceLevel> = {
      high: "high",
      medium: "medium",
      low: "low",
      decisionmaker: "high",
      stronginfluencer: "high",
      influencer: "medium",
      limitedinfluence: "low",
      critical: "high",
      moderate: "medium",
      minimal: "low"
    };
    return influenceMap[normalizedInfluence] || null;
  };

  // Apply document enrichment results
  const applyDocumentEnrichment = () => {
    if (!documentEnrichmentResult) return;
    
    const { callPlanner, meetingContact: docContact } = documentEnrichmentResult;
    
    // Update call planner fields (only if not already filled)
    setGreenSheetEdits(prev => ({
      objective: prev.objective || callPlanner.objective,
      desiredOutcome: prev.desiredOutcome || callPlanner.desiredOutcome,
      openingStatement: prev.openingStatement || callPlanner.openingStatement,
      bestActionCommitment: prev.bestActionCommitment || callPlanner.bestActionCommitment,
    }));
    
    // Map AI role and influence to valid enums
    const mappedRole = mapToBuyingRole(docContact.role);
    const mappedInfluence = mapToInfluenceLevel(docContact.influence);
    
    // Update meeting contact (only if not already filled)
    setMeetingContact(prev => ({
      ...prev,
      name: prev.name || docContact.name,
      title: prev.title || docContact.title,
      role: prev.role || mappedRole,
      influence: prev.influence || mappedInfluence,
      knownConcerns: prev.knownConcerns || docContact.knownConcerns,
      decisionCriteria: prev.decisionCriteria || docContact.decisionCriteria,
      personalRapport: prev.personalRapport || docContact.personalRapport,
    }));
    
    setShowDocumentEnrichDialog(false);
    toast({
      title: "Green Sheet enriched",
      description: "Fields have been populated from your pre-meeting documents."
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
        // Ensure all attendees have stable IDs and valid roles for their affiliation
        const clientRoles = ['economic_buyer', 'user_buyer', 'technical_buyer', 'coach', 'champion'];
        const internalRoles = ['account_lead', 'delivery_lead', 'consultant', 'subject_expert', 'executive_sponsor'];
        
        const attendeesWithIds = (profile.participants || []).map((p: any, idx: number) => {
          const isInternal = (p.affiliation || "client") === "internal";
          let role = p.role;
          
          // Reset role if it's not valid for the attendee's affiliation
          if (role) {
            const validRoles = isInternal ? internalRoles : clientRoles;
            if (!validRoles.includes(role)) {
              role = undefined; // Reset invalid role
            }
          }
          
          return {
            ...p,
            role,
            id: p.id || `attendee-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`
          };
        });
        setMeetingAttendees(attendeesWithIds);
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
    },
    refineResult: null as {
      overallScore: number;
      overallFeedback: string;
      strengths: string[];
      improvements: Array<{ element: string; currentIssue: string; suggestion: string; improvedVersion?: string }>;
      missingElements: string[];
      nextSteps: string[];
    } | null,
    selectedTemplates: [] as string[],
    templateRecommendations: null as {
      recommendations: Array<{
        templateId: string;
        score: number;
        rationale: string;
        fitReasons: string[];
        bestFor?: string;
      }>;
      suggestedCombination?: {
        templateIds: string[];
        reason: string;
      };
    } | null
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

  // Refine Story mutation - AI evaluates user content
  const [storyRefineResult, setStoryRefineResult] = useState<{
    overallScore: number;
    overallFeedback: string;
    strengths: string[];
    improvements: Array<{ element: string; currentIssue: string; suggestion: string; improvedVersion?: string }>;
    missingElements: string[];
    nextSteps: string[];
  } | null>(null);

  const refineStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ai/refine-story`, {
        storyData: storyBuilderData,
        meetingContext: {
          contactName: meetingContact.name,
          contactTitle: meetingContact.title,
          objective: greenSheetEdits.objective
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setStoryRefineResult(data);
      setAiSuggestionLoading(null);
      toast({ title: "Story Review Complete", description: `Score: ${data.overallScore}/10 - ${data.overallFeedback.slice(0, 50)}...` });
      
      // Also store refine result in storyBuilderData for persistence (auto-save will pick it up)
      setStoryBuilderData(prev => ({
        ...prev,
        refineResult: data
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Story Review Failed",
        description: error.message || "Could not review story. Please try again.",
        variant: "destructive"
      });
      setAiSuggestionLoading(null);
    }
  });

  const handleRefineStory = () => {
    setAiSuggestionLoading("refine");
    refineStoryMutation.mutate();
  };

  const handleGenerateAllPhase = (phase: "before" | "during" | "after") => {
    setAiSuggestionLoading("all");
    storySuggestionMutation.mutate({ fieldToSuggest: "all", phase, stories: [] });
  };

  const handleExportStory = () => {
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
    targetAudience?: "all" | "specific";
    targetAttendeeNames?: string[];
    rationale?: string;
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
        includeIntelligence: true,
        meetingMode: meetingMode,
        meetingAttendees: meetingMode === "multiple" ? meetingAttendees : undefined
      });
      return response.json();
    },
    onSuccess: (data: { 
      questions: Array<{ 
        question: string; 
        methodology: string; 
        stage: string; 
        outcome: string; 
        followUp: string;
        targetAudience?: "all" | "specific";
        targetAttendeeNames?: string[];
        rationale?: string;
      }>;
      attendeeCount?: number;
      attendeeNames?: string[];
    }) => {
      setSuggestedTensionQuestions(data.questions.map((q, i) => ({
        id: `ai-${Date.now()}-${i}`,
        question: q.question,
        methodology: q.methodology as "SPIN" | "MILLER_HEIMAN" | "PSS",
        stage: q.stage,
        outcome: q.outcome,
        followUp: q.followUp,
        selected: false,
        targetAudience: q.targetAudience || "all",
        targetAttendeeNames: q.targetAttendeeNames || [],
        rationale: q.rationale
      })));
      setTensionQuestionsLoading(false);
      
      // Show toast with attendee coverage info
      if (data.attendeeCount && data.attendeeCount > 1) {
        toast({
          title: `Generated ${data.questions.length} questions`,
          description: `Covering ${data.attendeeCount} attendees: ${data.attendeeNames?.join(", ")}`
        });
      }
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

  // Sync lifecycle stage when project data loads
  useEffect(() => {
    if (project?.csLifecycleStage) {
      setActiveLifecycleStage(project.csLifecycleStage);
    }
  }, [project?.csLifecycleStage]);

  const { data: insights = [] } = useQuery<ProjectInsight[]>({
    queryKey: ["/api/projects", projectId, "data-points"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/data-points`);
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

  // Evidence Pack data for Trust Velocity Scorecard
  const { data: evidenceData } = useQuery<any>({
    queryKey: ["/api/projects", projectId, "evidence-pack"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/evidence-pack`);
      if (!response.ok) return { items: [] };
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

  // Blue Sheet for Strategy stage
  const { data: blueSheet, isLoading: blueSheetLoading } = useQuery<any>({
    queryKey: ["/api/projects", projectId, "bluesheet"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/bluesheet`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: projectId > 0
  });

  // Blue Sheet generation mutation
  const generateBlueSheetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/bluesheet/generate`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "bluesheet"] });
      toast({
        title: "Blue Sheet Generated",
        description: "AI has created a strategic analysis based on your discovery data."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Blue Sheet update mutation for manual edits
  const updateBlueSheetMutation = useMutation({
    mutationFn: async (updates: { data: any }) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/bluesheet`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "bluesheet"] });
      toast({
        title: "Strategy Updated",
        description: "Your changes have been saved."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // State for manual buying influence management
  const [showAddInfluenceDialog, setShowAddInfluenceDialog] = useState(false);
  const [editingInfluenceIndex, setEditingInfluenceIndex] = useState<number | null>(null);
  const [expandedResearch, setExpandedResearch] = useState<Set<number>>(new Set());
  const [newInfluence, setNewInfluence] = useState({
    name: "",
    title: "",
    company: project?.companyName || "",
    role: "User" as "Economic" | "User" | "Technical" | "Coach",
    mode: "growth" as "Growth" | "Trouble" | "EvenKeel" | "Overconfident",
    degreeOfInfluence: "Medium" as "High" | "Medium" | "Low",
    personalWins: "",
    resultsWanted: "",
    notes: "",
    isManuallyAdded: true
  });

  // Add buying influence
  const handleAddInfluence = () => {
    if (!blueSheet?.data || !newInfluence.name.trim()) return;
    const updatedInfluences = [...(blueSheet.data.buyingInfluences || []), newInfluence];
    updateBlueSheetMutation.mutate({
      data: { ...blueSheet.data, buyingInfluences: updatedInfluences }
    });
    setNewInfluence({
      name: "",
      title: "",
      company: project?.companyName || "",
      role: "User",
      mode: "growth",
      degreeOfInfluence: "Medium",
      personalWins: "",
      resultsWanted: "",
      notes: "",
      isManuallyAdded: true
    });
    setShowAddInfluenceDialog(false);
  };

  // Update buying influence
  const handleUpdateInfluence = (index: number, updates: any) => {
    if (!blueSheet?.data) return;
    const updatedInfluences = [...blueSheet.data.buyingInfluences];
    updatedInfluences[index] = { ...updatedInfluences[index], ...updates };
    updateBlueSheetMutation.mutate({
      data: { ...blueSheet.data, buyingInfluences: updatedInfluences }
    });
    setEditingInfluenceIndex(null);
  };

  // Delete buying influence
  const handleDeleteInfluence = (index: number) => {
    if (!blueSheet?.data) return;
    const updatedInfluences = blueSheet.data.buyingInfluences.filter((_: any, i: number) => i !== index);
    updateBlueSheetMutation.mutate({
      data: { ...blueSheet.data, buyingInfluences: updatedInfluences }
    });
  };

  // Toggle research expansion
  const toggleResearchExpand = (index: number) => {
    setExpandedResearch(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

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
        // Include refineResult, selectedTemplates, templateRecommendations in initial data
        const fullInitialData = {
          ...initialData,
          refineResult: savedData.refineResult || null,
          selectedTemplates: savedData.selectedTemplates || [],
          templateRecommendations: savedData.templateRecommendations || null
        };
        lastSavedStoryBuilderDataRef.current = JSON.stringify(fullInitialData);
        setStoryBuilderData(fullInitialData);
        if (savedData.lastUpdated) {
          setStoryBuilderLastSaved(`Last saved ${new Date(savedData.lastUpdated).toLocaleTimeString()}`);
        }
        // Restore saved refine result to the separate state for display
        if (savedData.refineResult) {
          setStoryRefineResult(savedData.refineResult);
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

    // Fetch strategy selection for live outcomes data
    const { data: strategySelectionData } = useQuery<{
      id: number;
      projectId: number;
      selectedStrategiesData: {
        strategies: any[];
        selectedIds: string[];
        customStrategies: any[];
      } | null;
      generatedOutcomesData: {
        outcomes: any[];
        selectedOutcomeIds: string[];
      } | null;
      handoffConfirmed: boolean;
      status: string;
    }>({
      queryKey: ["/api/projects", projectId, "strategy-selection"],
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
          {/* Unified Value Journey - Enhanced with Timeline Groupings and Value Totals */}
          {(() => {
          // Map Korn Ferry solutions to solution patterns for strategy-selection outcomes
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

          // Get outcomes from strategy-selection (live data)
          const strategyOutcomes = strategySelectionData?.generatedOutcomesData?.outcomes || [];
          const existingCommitmentNames = new Set((commitments as any[]).map(c => c.name));
          
          // Convert strategy-selection outcomes to commitment-like format for journey view
          const strategyOutcomesForJourney = strategyOutcomes
            .filter((o: any) => !existingCommitmentNames.has(o.outcomeName)) // Exclude already converted
            .map((o: any, idx: number) => {
              // Use mapping or default to org_transformation for unknown solutions
              const solutionPattern = kornFerrySolutionToPattern[o.kornFerrySolution] || "org_transformation";
              const valueStr = o.estimatedAnnualValue || "";
              const valueNum = parseFloat(valueStr.replace(/[^0-9.-]/g, '')) || 0;
              return {
                id: `strategy-${o.id || idx}`,
                name: o.outcomeName,
                solutionPattern,
                valuePillar: o.valuePillar || 'grow',
                estimatedAnnualValue: valueNum * (valueStr.includes('M') ? 1000000 : valueStr.includes('K') ? 1000 : 1),
                status: 'draft',
                description: o.businessImpact,
                baselineValue: o.kpiDetails?.suggestedBaseline,
                targetValue: o.kpiDetails?.suggestedTarget,
                metricUnit: o.kpiDetails?.unit,
                provenance: { kornFerrySolution: o.kornFerrySolution },
                isFromStrategySelection: true
              };
            }); // All outcomes now included with fallback pattern

          // Combine commitments with strategy-selection outcomes
          // Include all commitments, assigning default pattern if missing
          const commitmentsWithDefaultPattern = (commitments as any[]).map(c => ({
            ...c,
            solutionPattern: c.solutionPattern || "org_transformation"
          }));
          
          const allCommitmentsWithPattern = [
            ...commitmentsWithDefaultPattern,
            ...strategyOutcomesForJourney
          ];
          
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
            selected: timelineSelectedOutcomes.size === 0 || timelineSelectedOutcomes.has(c.id.toString()),
            status: c.status || 'draft',
            description: c.description || c.commitmentDescription || undefined,
            baselineValue: c.baselineValue || undefined,
            targetValue: c.targetValue || undefined,
            metricUnit: c.metricUnit || c.kpiUnit || undefined,
            strategyName: c.provenance?.kornFerrySolution || undefined
          }));

          const selectedCount = selectedOutcomesForTimeline.filter(o => o.selected).length;
          const totalCount = selectedOutcomesForTimeline.length;
          const selectedValue = sortedCommitments
            .filter(c => timelineSelectedOutcomes.size === 0 || timelineSelectedOutcomes.has(c.id.toString()))
            .reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
          
          return (
            <Card data-testid="unified-journey-section" className="mt-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Detailed Journey View</CardTitle>
                    <CardDescription>
                      Implementation roadmap for selected outcomes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
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
              </CardContent>
            </Card>
          );
        })()}
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

  // Evidence Pack Inline Component
  const EvidencePackInline = ({ projectId, projectName }: { projectId: number; projectName?: string }) => {
    const [addItemOpen, setAddItemOpen] = useState(false);
    const [newItemClaim, setNewItemClaim] = useState("");
    const [newItemType, setNewItemType] = useState<string>("claim");
    const [audienceView, setAudienceView] = useState<"customer" | "internal">("customer");
    
    // New state for enhanced pack items
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPillar, setFilterPillar] = useState<string>("all");
    
    const { data: evidenceData, isLoading: evidenceLoading, refetch: refetchEvidence } = useQuery<any>({
      queryKey: [`/api/projects/${projectId}/evidence-pack`],
      enabled: !!projectId,
    });

    const createPackMutation = useMutation({
      mutationFn: async () => {
        return await apiRequest("POST", `/api/projects/${projectId}/evidence-pack`, {
          title: `${projectName || 'Project'} - Evidence Pack`,
          ownerName: "Seller",
          ownerId: "current-user",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ title: "Evidence Pack created" });
      },
      onError: (error: Error) => {
        toast({ title: "Failed to create pack", description: error.message, variant: "destructive" });
      },
    });

    const addItemMutation = useMutation({
      mutationFn: async (itemData: { claim: string; itemType: string }) => {
        return await apiRequest("POST", `/api/evidence-packs/${evidenceData?.pack?.id}/items`, {
          ...itemData,
          actorName: "Seller",
          actorId: "current-user",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        setNewItemClaim("");
        setNewItemType("claim");
        setAddItemOpen(false);
        toast({ title: "Item added to pack" });
      },
    });

    const deleteItemMutation = useMutation({
      mutationFn: async (itemId: number) => {
        return await apiRequest("DELETE", `/api/evidence-pack-items/${itemId}`, {
          actorName: "Seller",
          actorId: "current-user",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ title: "Item removed" });
      },
    });

    const updateItemStatusMutation = useMutation({
      mutationFn: async ({ itemId, status }: { itemId: number; status: string }) => {
        return await apiRequest("PATCH", `/api/evidence-pack-items/${itemId}`, {
          itemStatus: status,
          actorName: "Seller",
          actorId: "current-user",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ title: "Item status updated" });
      },
    });

    const bulkUpdateStatusMutation = useMutation({
      mutationFn: async ({ itemIds, status }: { itemIds: number[]; status: string }) => {
        const promises = itemIds.map(itemId => 
          apiRequest("PATCH", `/api/evidence-pack-items/${itemId}`, {
            itemStatus: status,
            actorName: "Seller",
            actorId: "current-user",
          })
        );
        return Promise.all(promises);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        setSelectedItems(new Set());
        toast({ title: "Items updated" });
      },
      onError: (error: Error) => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ title: "Some items failed to update", description: error.message, variant: "destructive" });
      },
    });

    const bulkDeleteMutation = useMutation({
      mutationFn: async (itemIds: number[]) => {
        const promises = itemIds.map(itemId => 
          apiRequest("DELETE", `/api/evidence-pack-items/${itemId}`, {
            actorName: "Seller",
            actorId: "current-user",
          })
        );
        return Promise.all(promises);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        setSelectedItems(new Set());
        toast({ title: "Items deleted" });
      },
      onError: (error: Error) => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ title: "Some items failed to delete", description: error.message, variant: "destructive" });
      },
    });

    const submitForReviewMutation = useMutation({
      mutationFn: async () => {
        return await apiRequest("PATCH", `/api/evidence-packs/${evidenceData?.pack?.id}`, {
          status: "pending_review",
          actorName: "Seller",
          actorId: "current-user",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ title: "Submitted for review" });
      },
    });

    const getRecommendationsMutation = useMutation({
      mutationFn: async () => {
        return await apiRequest("POST", `/api/evidence-packs/${evidenceData?.pack?.id}/recommendations`, {
          phase: "discovery"
        });
      },
      onSuccess: (data: any) => {
        toast({ title: "AI generated recommendations" });
        refetchEvidence();
      },
    });

    const autoPopulateMutation = useMutation({
      mutationFn: async () => {
        return await apiRequest("POST", `/api/evidence-packs/${evidenceData?.pack?.id}/auto-populate`, {});
      },
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        toast({ 
          title: "Evidence imported",
          description: `Added ${data.itemsCreated} items from your project data`
        });
      },
      onError: (error: Error) => {
        toast({ title: "Import failed", description: error.message, variant: "destructive" });
      },
    });

    const pack = evidenceData?.pack;
    const allItems = evidenceData?.items || [];
    
    // Filter items by audience scope, type, status, and pillar
    const items = allItems.filter((item: any) => {
      const scope = item.audienceScope || "both";
      const matchesAudience = audienceView === "customer" 
        ? (scope === "customer" || scope === "both")
        : (scope === "internal" || scope === "both");
      const matchesType = filterType === "all" || item.itemType === filterType;
      const matchesStatus = filterStatus === "all" || item.itemStatus === filterStatus;
      const matchesPillar = filterPillar === "all" || (item.valuePillar || "unassigned") === filterPillar;
      return matchesAudience && matchesType && matchesStatus && matchesPillar;
    });
    
    // Get unique item types and statuses for filter dropdowns
    const uniqueTypes: string[] = Array.from(new Set(allItems.map((i: any) => i.itemType).filter(Boolean) as string[]));
    const uniqueStatuses: string[] = Array.from(new Set(allItems.map((i: any) => i.itemStatus).filter(Boolean) as string[]));
    
    // Helper functions for selection
    const toggleItemSelection = (itemId: number) => {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) newSet.delete(itemId);
        else newSet.add(itemId);
        return newSet;
      });
    };
    
    const selectAllItems = () => {
      if (selectedItems.size === items.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(items.map((i: any) => i.id)));
      }
    };
    
    const toggleSection = (sectionKey: string) => {
      setCollapsedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionKey)) newSet.delete(sectionKey);
        else newSet.add(sectionKey);
        return newSet;
      });
    };
    
    // Group items by type for organized display
    const itemsByType = items.reduce((acc: Record<string, any[]>, item: any) => {
      const type = item.itemType || "other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});
    
    // Group items by journey phase for narrative storytelling
    const itemsByPhase = items.reduce((acc: Record<string, any[]>, item: any) => {
      const phase = item.evidencePhase || "leading";
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(item);
      return acc;
    }, {});
    
    // KF Offerings lookup helper
    const getKFOffering = (item: any): string | null => {
      if (item.kfOffering) return item.kfOffering;
      if (item.provenance?.kfOffering) return item.provenance.kfOffering;
      return null;
    };
    
    // Value pillar grouping for Client View
    const valuePillarConfig: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
      grow: { label: "Grow", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-500/10 border-green-500/30", description: "Revenue & market expansion" },
      optimise: { label: "Optimise", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/30", description: "Efficiency & productivity" },
      derisk: { label: "De-risk", color: "text-orange-700 dark:text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/30", description: "Risk mitigation & compliance" },
      strengthen: { label: "Strengthen", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/30", description: "Capability & culture building" },
    };
    
    // Skill domain config for Coaching View scorecard
    const skillDomainConfig: Record<string, { label: string; icon: typeof Heart }> = {
      soft_skill: { label: "Soft Skills", icon: Heart },
      hard_data: { label: "Hard Data", icon: BarChart3 },
      relationship: { label: "Relationship", icon: Users },
      skills_building: { label: "Skills Building", icon: GraduationCap },
    };
    
    // Journey phase configuration - tells a story instead of dumping data
    const journeyPhaseConfig: Record<string, { 
      label: string; 
      description: string; 
      color: string; 
      bgColor: string;
      icon: typeof Eye;
      narrative: string;
    }> = {
      leading: { 
        label: "What We Saw Before Results", 
        description: "Discovery insights, success frame, stakeholder mapping",
        color: "text-blue-700 dark:text-blue-400",
        bgColor: "bg-blue-500/10 border-blue-500/30",
        icon: Eye,
        narrative: "Before the numbers moved, here's what the team observed through careful discovery..."
      },
      mid_loop: { 
        label: "How Discipline Held Under Pressure", 
        description: "Assumption revisions, risk articulation, behavior signals",
        color: "text-amber-700 dark:text-amber-400",
        bgColor: "bg-amber-500/10 border-amber-500/30",
        icon: Shield,
        narrative: "When circumstances changed, here's how the engagement adapted..."
      },
      lagging: { 
        label: "Results with Context", 
        description: "Outcomes achieved, KPIs delivered, artifacts",
        color: "text-green-700 dark:text-green-400",
        bgColor: "bg-green-500/10 border-green-500/30",
        icon: Trophy,
        narrative: "The results speak to the journey, not just the destination..."
      },
    };
    
    // Group by value pillar for Client View
    const itemsByPillar = items.reduce((acc: Record<string, any[]>, item: any) => {
      const pillar = item.valuePillar || "unassigned";
      if (!acc[pillar]) acc[pillar] = [];
      acc[pillar].push(item);
      return acc;
    }, {});
    
    // Calculate metrics
    const approvedCount = items.filter((i: any) => i.itemStatus === "approved" || i.itemStatus === "validated").length;
    const successStories = items.filter((i: any) => i.itemType === "success_story" || i.itemType === "testimonial");
    const kpiItems = items.filter((i: any) => i.itemType === "kpi" || i.itemType === "outcome");
    const hiddenInternalCount = allItems.filter((i: any) => (i.audienceScope === "internal") && audienceView === "customer").length;

    const statusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
      draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
      pending_review: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-700", icon: Clock },
      in_review: { label: "In Review", color: "bg-blue-500/20 text-blue-700", icon: Eye },
      approved: { label: "Approved", color: "bg-green-500/20 text-green-700", icon: CheckCircle2 },
      rejected: { label: "Needs Work", color: "bg-red-500/20 text-red-700", icon: AlertCircle },
      shared: { label: "Shared", color: "bg-purple-500/20 text-purple-700", icon: ExternalLink },
    };

    const itemStatusConfig: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
      pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-700" },
      validated: { label: "Validated", color: "bg-green-500/20 text-green-700" },
      approved: { label: "Approved", color: "bg-green-500/20 text-green-700" },
      flagged: { label: "Flagged", color: "bg-orange-500/20 text-orange-700" },
      rejected: { label: "Rejected", color: "bg-red-500/20 text-red-700" },
      needs_evidence: { label: "Needs Evidence", color: "bg-yellow-500/20 text-yellow-700" },
      needs_stakeholder_validation: { label: "Needs Validation", color: "bg-blue-500/20 text-blue-700" },
      needs_input: { label: "Needs Input", color: "bg-purple-500/20 text-purple-700" },
    };

    const itemTypeIcons: Record<string, typeof Target> = {
      // Original types
      claim: Target,
      insight: Lightbulb,
      outcome: TrendingUp,
      success_story: Award,
      benchmark: FileText,
      testimonial: MessageSquare,
      artifact: Briefcase,
      // Quantitative evidence
      kpi: TrendingUp,
      baseline: BarChart3,
      target: Target,
      assumption: HelpCircle,
      // Discovery evidence
      stakeholder_claim: Users,
      meeting_insight: MessageSquare,
      stakeholder_trust_signal: Heart,
      engagement_indicator: Activity,
      // Journey/trust types
      success_frame: Eye,
      assumption_revision: RefreshCw,
      risk_articulation: Shield,
      handoff_quality: Handshake,
      reusability_pattern: Copy,
      trust_milestone: Trophy,
      // Behavior/adoption
      behavior_condition: GitBranch,
      behavior_signal: Activity,
      lever_applied: Zap,
      // Delivery proof
      outcome_signal: CheckCircle2,
      proof_object: FileCheck,
      // Coaching & relationship
      coaching_observation: GraduationCap,
      communication_signal: MessageCircle,
      leadership_behavior: Crown,
      skill_growth_metric: TrendingUp,
      relationship_milestone: Heart,
      // Deal progression
      risk: AlertTriangle,
      decision: ThumbsUp,
      commitment: Handshake,
      deliverable: Package,
      next_action: ArrowRight,
    };

    if (evidenceLoading) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading evidence pack...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!pack) {
      return (
        <Card className="border-dashed border-2" data-testid="evidence-pack-empty">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Evidence Pack</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                Build a collection of claims and proof points to support your value proposition with stakeholders.
              </p>
              <Button 
                onClick={() => createPackMutation.mutate()}
                disabled={createPackMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="button-create-evidence-pack"
              >
                {createPackMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Create Evidence Pack</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    const status = statusConfig[pack.status] || statusConfig.draft;
    const StatusIcon = status.icon;

    return (
      <div className="space-y-6" data-testid="evidence-pack-content">
        {/* Header with View Toggle */}
        <Card className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Evidence Pack
                    <Badge className={`${status.color} text-xs`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {items.length} item{items.length !== 1 ? 's' : ''} · Evidence journey: Discovery to Results
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => autoPopulateMutation.mutate()}
                  disabled={autoPopulateMutation.isPending}
                  data-testid="button-auto-populate"
                >
                  {autoPopulateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Importing...</>
                  ) : (
                    <><Database className="w-4 h-4 mr-1" /> Import Data</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getRecommendationsMutation.mutate()}
                  disabled={getRecommendationsMutation.isPending}
                  data-testid="button-ai-recommendations"
                >
                  {getRecommendationsMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-1" /> AI Suggest</>
                  )}
                </Button>
                {pack.status === "draft" && allItems.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => submitForReviewMutation.mutate()}
                    disabled={submitForReviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Submit for Review
                  </Button>
                )}
              </div>
            </div>
            
            {/* Client View / Coaching View Toggle */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                <Button
                  size="sm"
                  variant={audienceView === "customer" ? "default" : "ghost"}
                  onClick={() => setAudienceView("customer")}
                  className="h-9"
                  data-testid="button-client-view"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Client View
                </Button>
                <Button
                  size="sm"
                  variant={audienceView === "internal" ? "secondary" : "ghost"}
                  onClick={() => setAudienceView("internal")}
                  className="h-9"
                  data-testid="button-coaching-view"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Coaching View
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {audienceView === "customer" 
                  ? "What clients will see when you share this pack" 
                  : `Internal coaching metrics (${hiddenInternalCount} internal-only items)`}
              </p>
            </div>
          </CardHeader>
        </Card>
        
        {/* CLIENT VIEW - Journey Narrative (Executive-Friendly Storytelling) */}
        {audienceView === "customer" && items.length > 0 && (
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-green-500/5" data-testid="client-view-narrative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                The Value Story
              </CardTitle>
              <CardDescription>
                How we created measurable impact through disciplined engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Journey Timeline - Visual Story Flow */}
              <div className="flex items-center justify-center gap-4 flex-wrap mb-6" data-testid="journey-timeline">
                <div className="flex items-center gap-2" data-testid="timeline-phase-discovered">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-medium text-blue-600" data-testid="text-discovered">Discovered</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2" data-testid="timeline-phase-adapted">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs font-medium text-amber-600" data-testid="text-adapted">Adapted</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2" data-testid="timeline-phase-achieved">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-xs font-medium text-green-600" data-testid="text-achieved">Achieved</span>
                </div>
              </div>
              
              {/* Three-Column Journey Summary */}
              <div className="grid grid-cols-3 gap-4" data-testid="journey-summary-columns">
                {/* Discovery Column */}
                <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5" data-testid="summary-column-discovered">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> What We Found
                  </h4>
                  <div className="space-y-2">
                    {(itemsByPhase['leading'] || []).slice(0, 2).map((item: any) => (
                      <p key={item.id} className="text-xs text-muted-foreground line-clamp-2">
                        {item.claim}
                      </p>
                    ))}
                    {(itemsByPhase['leading'] || []).length > 2 && (
                      <p className="text-xs text-blue-600">+{(itemsByPhase['leading'] || []).length - 2} more insights</p>
                    )}
                    {!(itemsByPhase['leading'] || []).length && (
                      <p className="text-xs text-muted-foreground italic">Building discovery...</p>
                    )}
                  </div>
                </div>
                
                {/* Discipline Column */}
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5" data-testid="summary-column-adapted">
                  <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> How We Adapted
                  </h4>
                  <div className="space-y-2">
                    {(itemsByPhase['mid_loop'] || []).slice(0, 2).map((item: any) => (
                      <p key={item.id} className="text-xs text-muted-foreground line-clamp-2">
                        {item.claim}
                      </p>
                    ))}
                    {(itemsByPhase['mid_loop'] || []).length > 2 && (
                      <p className="text-xs text-amber-600">+{(itemsByPhase['mid_loop'] || []).length - 2} more signals</p>
                    )}
                    {!(itemsByPhase['mid_loop'] || []).length && (
                      <p className="text-xs text-muted-foreground italic">Tracking discipline...</p>
                    )}
                  </div>
                </div>
                
                {/* Results Column */}
                <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5" data-testid="summary-column-achieved">
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> What We Achieved
                  </h4>
                  <div className="space-y-2">
                    {(itemsByPhase['lagging'] || []).slice(0, 2).map((item: any) => (
                      <p key={item.id} className="text-xs text-muted-foreground line-clamp-2">
                        {item.claim}
                      </p>
                    ))}
                    {(itemsByPhase['lagging'] || []).length > 2 && (
                      <p className="text-xs text-green-600">+{(itemsByPhase['lagging'] || []).length - 2} more outcomes</p>
                    )}
                    {!(itemsByPhase['lagging'] || []).length && (
                      <p className="text-xs text-muted-foreground italic">Capturing results...</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Key Metrics Summary */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t" data-testid="journey-metrics">
                <div className="text-center p-3 bg-background rounded-lg border" data-testid="metric-outcomes">
                  <div className="text-2xl font-bold text-green-600" data-testid="value-outcomes">{kpiItems.length}</div>
                  <div className="text-xs text-muted-foreground">Outcomes Delivered</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border" data-testid="metric-validated">
                  <div className="text-2xl font-bold text-blue-600" data-testid="value-validated">{approvedCount}</div>
                  <div className="text-xs text-muted-foreground">Validated Points</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border" data-testid="metric-stories">
                  <div className="text-2xl font-bold text-amber-600" data-testid="value-stories">{successStories.length}</div>
                  <div className="text-xs text-muted-foreground">Success Stories</div>
                </div>
              </div>
              
              {/* Data Source Attribution */}
              <div className="pt-4 border-t" data-testid="source-attribution">
                <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Link2 className="w-3 h-3" /> Evidence Sources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const sourceCounts: Record<string, number> = {};
                    items.forEach((item: any) => {
                      const source = item.sourceType || 'manual';
                      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
                    });
                    const sourceLabelsInline: Record<string, string> = {
                      kpi_commitment: "KPI Commitments",
                      discovery_insight: "Discovery Insights",
                      discovery_notes: "Discovery Notes",
                      bluesheet: "Blue Sheet",
                      evidence_artefact: "Documents",
                      success_story_library: "Success Stories",
                      business_review: "Business Reviews",
                      manual: "Manual Entries",
                    };
                    return Object.entries(sourceCounts).map(([source, count]) => (
                      <Badge key={source} variant="outline" className="text-xs" data-testid={`source-count-${source}`}>
                        {sourceLabelsInline[source] || source.replace(/_/g, ' ')}: {count}
                      </Badge>
                    ));
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* CLIENT VIEW - Value Pillar Cards */}
        {audienceView === "customer" && items.length > 0 && Object.entries(valuePillarConfig).some(([k]) => (itemsByPillar[k] || []).length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Value by Strategic Pillar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(valuePillarConfig).map(([pillarKey, pillarInfo]) => {
                  const pillarItems = itemsByPillar[pillarKey] || [];
                  if (pillarItems.length === 0) return null;
                  
                  return (
                    <div key={pillarKey} className={`p-4 rounded-lg ${pillarInfo.bgColor} border`}>
                      <h4 className={`text-sm font-semibold ${pillarInfo.color} mb-1`}>{pillarInfo.label}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{pillarInfo.description}</p>
                      <div className="space-y-2">
                        {pillarItems.slice(0, 3).map((item: any) => {
                          const ItemIcon = itemTypeIcons[item.itemType] || Target;
                          return (
                            <div key={item.id} className="flex items-start gap-2 p-2 bg-background rounded border text-sm">
                              <ItemIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{item.claim}</span>
                            </div>
                          );
                        })}
                        {pillarItems.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{pillarItems.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* CLIENT VIEW - Success Stories */}
        {audienceView === "customer" && successStories.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Award className="w-4 h-4" />
                Success Stories & Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {successStories.map((story: any) => (
                <div key={story.id} className="p-4 bg-background rounded-lg border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm italic">"{story.claim}"</p>
                      {story.sourceType && (
                        <p className="text-xs text-muted-foreground mt-2">— via {story.sourceType.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* COACHING VIEW - Trust Velocity Scorecard */}
        {audienceView === "internal" && items.length > 0 && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Trust Velocity Scorecard
              </CardTitle>
              <CardDescription className="text-xs">Behavioral quality signals beyond the numbers</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {/* Leading Phase Progress */}
                <div className="p-3 rounded-md bg-background border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Discovery Signals</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-blue-600">{(itemsByPhase['leading'] || []).length}</span>
                    <span className="text-xs text-muted-foreground">leading indicators</span>
                  </div>
                  <Progress value={Math.min(100, ((itemsByPhase['leading'] || []).length / 5) * 100)} className="h-1 mt-2" />
                </div>
                
                {/* Mid-Loop Phase Progress */}
                <div className="p-3 rounded-md bg-background border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Deal Discipline</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-amber-600">{(itemsByPhase['mid_loop'] || []).length}</span>
                    <span className="text-xs text-muted-foreground">behavior signals</span>
                  </div>
                  <Progress value={Math.min(100, ((itemsByPhase['mid_loop'] || []).length / 3) * 100)} className="h-1 mt-2" />
                </div>
                
                {/* Lagging Phase Progress */}
                <div className="p-3 rounded-md bg-background border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Results Documented</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-green-600">{(itemsByPhase['lagging'] || []).length}</span>
                    <span className="text-xs text-muted-foreground">outcomes captured</span>
                  </div>
                  <Progress value={Math.min(100, ((itemsByPhase['lagging'] || []).length / 5) * 100)} className="h-1 mt-2" />
                </div>
                
                {/* Story Completeness */}
                <div className="p-3 rounded-md bg-background border">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium">Story Completeness</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{
                      Math.round(
                        (((itemsByPhase['leading'] || []).length > 0 ? 33 : 0) +
                        ((itemsByPhase['mid_loop'] || []).length > 0 ? 33 : 0) +
                        ((itemsByPhase['lagging'] || []).length > 0 ? 34 : 0))
                      )
                    }%</span>
                    <span className="text-xs text-muted-foreground">journey coverage</span>
                  </div>
                  <Progress value={
                    ((itemsByPhase['leading'] || []).length > 0 ? 33 : 0) +
                    ((itemsByPhase['mid_loop'] || []).length > 0 ? 33 : 0) +
                    ((itemsByPhase['lagging'] || []).length > 0 ? 34 : 0)
                  } className="h-1 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* COACHING VIEW - Skills Scorecard */}
        {audienceView === "internal" && items.length > 0 && (
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                Skills & Relationship Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(skillDomainConfig).map(([domain, config]) => {
                  const domainItems = items.filter((item: any) => item.skillDomain === domain);
                  const DomainIcon = config.icon;
                  const validatedCount = domainItems.filter((item: any) => 
                    item.itemStatus === "approved" || item.itemStatus === "validated"
                  ).length;
                  
                  return (
                    <div key={domain} className="p-3 rounded-md bg-background border">
                      <div className="flex items-center gap-2 mb-1">
                        <DomainIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium">{config.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold">{domainItems.length}</span>
                        <span className="text-xs text-muted-foreground">items</span>
                        {validatedCount > 0 && (
                          <span className="text-xs text-green-600 ml-auto">{validatedCount} validated</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pack Items with Filter Bar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Pack Items</CardTitle>
                <Badge variant="secondary" className="text-xs">{items.length} of {allItems.length}</Badge>
              </div>
              <Button 
                size="sm" 
                onClick={() => setAddItemOpen(!addItemOpen)}
                data-testid="button-add-item"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] text-xs" data-testid="filter-type">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type: string) => (
                    <SelectItem key={type} value={type} className="capitalize">{type.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] text-xs" data-testid="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map((status: string) => (
                    <SelectItem key={status} value={status} className="capitalize">{status.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterPillar} onValueChange={setFilterPillar}>
                <SelectTrigger className="w-[130px] text-xs" data-testid="filter-pillar">
                  <SelectValue placeholder="Value Pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pillars</SelectItem>
                  {Object.entries(valuePillarConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
              
              {(filterType !== "all" || filterStatus !== "all" || filterPillar !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setFilterType("all"); setFilterStatus("all"); setFilterPillar("all"); }}
                  data-testid="button-clear-filters"
                >
                  <X className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {addItemOpen && (
              <div className="mb-4 p-4 rounded-lg border bg-muted/30 space-y-3">
                <div>
                  <Label htmlFor="item-claim">Claim or Statement</Label>
                  <Textarea
                    id="item-claim"
                    placeholder="e.g., Increased sales productivity by 25% within 6 months"
                    value={newItemClaim}
                    onChange={(e) => setNewItemClaim(e.target.value)}
                    className="mt-1"
                    data-testid="input-item-claim"
                  />
                </div>
                <div>
                  <Label>Item Type</Label>
                  <Select value={newItemType} onValueChange={setNewItemType}>
                    <SelectTrigger className="mt-1" data-testid="select-item-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claim">Claim</SelectItem>
                      <SelectItem value="insight">Insight</SelectItem>
                      <SelectItem value="outcome">Outcome</SelectItem>
                      <SelectItem value="kpi">KPI</SelectItem>
                      <SelectItem value="baseline">Baseline</SelectItem>
                      <SelectItem value="target">Target</SelectItem>
                      <SelectItem value="assumption">Assumption</SelectItem>
                      <SelectItem value="stakeholder_claim">Stakeholder Quote</SelectItem>
                      <SelectItem value="meeting_insight">Meeting Insight</SelectItem>
                      <SelectItem value="behavior_condition">Behavior Condition</SelectItem>
                      <SelectItem value="behavior_signal">Behavior Signal</SelectItem>
                      <SelectItem value="lever_applied">Lever Applied</SelectItem>
                      <SelectItem value="outcome_signal">Outcome Signal</SelectItem>
                      <SelectItem value="proof_object">Proof Object</SelectItem>
                      <SelectItem value="success_story">Success Story</SelectItem>
                      <SelectItem value="benchmark">Benchmark</SelectItem>
                      <SelectItem value="testimonial">Testimonial</SelectItem>
                      <SelectItem value="risk">Risk</SelectItem>
                      <SelectItem value="decision">Decision</SelectItem>
                      <SelectItem value="commitment">Commitment</SelectItem>
                      <SelectItem value="deliverable">Deliverable</SelectItem>
                      <SelectItem value="next_action">Next Action</SelectItem>
                      <SelectItem value="success_frame">Success Frame</SelectItem>
                      <SelectItem value="assumption_revision">Assumption Revision</SelectItem>
                      <SelectItem value="risk_articulation">Risk Articulation</SelectItem>
                      <SelectItem value="handoff_quality">Handoff Quality</SelectItem>
                      <SelectItem value="reusability_pattern">Reusability Pattern</SelectItem>
                      <SelectItem value="trust_milestone">Trust Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => addItemMutation.mutate({ claim: newItemClaim, itemType: newItemType })}
                    disabled={!newItemClaim.trim() || addItemMutation.isPending}
                    data-testid="button-save-item"
                  >
                    {addItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddItemOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No items yet. Add claims and proof points to build your evidence pack.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedItems.size === items.length && items.length > 0}
                    onCheckedChange={selectAllItems}
                    data-testid="checkbox-select-all"
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : "Select all"}
                  </span>
                </div>
                
                {/* Story Thread Connector */}
                {(() => {
                  const hasLeading = (itemsByPhase['leading'] || []).length > 0;
                  const hasMidLoop = (itemsByPhase['mid_loop'] || []).length > 0;
                  const hasLagging = (itemsByPhase['lagging'] || []).length > 0;
                  const threadCount = [hasLeading, hasMidLoop, hasLagging].filter(Boolean).length;
                  
                  if (threadCount < 2) return null;
                  
                  return (
                    <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500/5 via-amber-500/5 to-green-500/5 rounded-lg border border-dashed" data-testid="story-thread-connector">
                      <Link2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Story flows through {threadCount} phases
                        {threadCount === 3 && " — Complete journey documented"}
                      </span>
                      {threadCount === 3 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                  );
                })()}
                
                {/* Journey Phase Sections - Storytelling Approach */}
                {['leading', 'mid_loop', 'lagging'].map((phase, phaseIndex) => {
                  const phaseItems = itemsByPhase[phase] || [];
                  if (phaseItems.length === 0) return null;
                  
                  const phaseConfig = journeyPhaseConfig[phase];
                  const PhaseIcon = phaseConfig.icon;
                  const isCollapsed = collapsedSections.has(phase);
                  const phases = ['leading', 'mid_loop', 'lagging'];
                  const nextPhase = phases[phaseIndex + 1];
                  const hasNextPhase = nextPhase && (itemsByPhase[nextPhase] || []).length > 0;
                  
                  return (
                    <div key={phase}>
                      <div className={`border rounded-lg ${phaseConfig.bgColor}`}>
                      <button
                        onClick={() => toggleSection(phase)}
                        className="w-full flex items-start justify-between p-4 hover-elevate rounded-t-lg"
                        data-testid={`section-toggle-${phase}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <PhaseIcon className={`w-5 h-5 ${phaseConfig.color}`} />
                            <span className={`text-sm font-semibold ${phaseConfig.color}`}>{phaseConfig.label}</span>
                            <Badge variant="secondary" className="text-xs">{phaseItems.length}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground italic pl-7">{phaseConfig.narrative}</p>
                        </div>
                        {isCollapsed ? <ChevronRight className="w-4 h-4 mt-1" /> : <ChevronDown className="w-4 h-4 mt-1" />}
                      </button>
                      
                      {!isCollapsed && (
                        <div className="p-2 space-y-2 border-t">
                          {phaseItems.map((item: any) => {
                            const ItemIcon = itemTypeIcons[item.itemType] || Target;
                            const itemStatusCfg = itemStatusConfig[item.itemStatus] || itemStatusConfig.draft;
                            const kfOffering = getKFOffering(item);
                            const isSelected = selectedItems.has(item.id);
                            
                            const sourceLabels: Record<string, string> = {
                              kpi_commitment: "KPI Commitment",
                              discovery_insight: "Discovery Insight",
                              bluesheet: "Blue Sheet",
                              artifact: "Artifact",
                              evidence_artefact: "Document",
                              interaction: "Interaction",
                              notes: "Notes",
                              discovery_notes: "Discovery Notes",
                              engagement_log: "Engagement",
                              meeting_notes: "Meeting",
                              success_story: "Success Story",
                              success_story_library: "Success Library",
                              business_review: "Business Review",
                              assumption_revision: "Adaptation",
                              decision_log: "Decision",
                              kpi_actual: "KPI Result",
                              deliverable: "Deliverable",
                              manual: "Manual",
                              ai_generated: "AI",
                            };
                            const sourceTabMap: Record<string, string> = {
                              kpi_commitment: "align",
                              discovery_insight: "discover",
                              discovery_notes: "discover",
                              notes: "discover",
                              bluesheet: "strategy",
                              success_story: "realize",
                              success_story_library: "realize",
                              business_review: "realize",
                              kpi_actual: "realize",
                              deliverable: "realize",
                              engagement_log: "engage",
                              meeting_notes: "engage",
                            };
                            
                            return (
                              <div 
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border bg-background hover-elevate group ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
                                data-testid={`evidence-item-${item.id}`}
                              >
                                {/* Checkbox */}
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleItemSelection(item.id)}
                                  className="mt-1"
                                  data-testid={`checkbox-item-${item.id}`}
                                />
                                
                                {/* Icon */}
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                  <ItemIcon className="w-4 h-4 text-amber-600" />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p 
                                    className="text-sm font-medium cursor-pointer hover:text-primary"
                                    onClick={() => setPreviewItem(item)}
                                    data-testid={`link-preview-${item.id}`}
                                  >
                                    {item.claim}
                                  </p>
                                  
                                  {/* Metadata Row */}
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {/* Value Pillar */}
                                    {item.valuePillar && valuePillarConfig[item.valuePillar] && (
                                      <Badge className={`text-xs ${valuePillarConfig[item.valuePillar].bgColor}`}>
                                        {valuePillarConfig[item.valuePillar].label}
                                      </Badge>
                                    )}
                                    
                                    {/* KF Offering Tag */}
                                    {kfOffering && (
                                      <Badge variant="outline" className="text-xs bg-blue-500/5 border-blue-500/30 text-blue-700 dark:text-blue-300">
                                        {kfOffering}
                                      </Badge>
                                    )}
                                    
                                    {/* Confidence Indicator */}
                                    {item.confidence && (
                                      <Badge variant="outline" className="text-xs">
                                        {item.confidence > 0.7 ? <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> : <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />}
                                        {Math.round(item.confidence * 100)}%
                                      </Badge>
                                    )}
                                    
                                    {/* Stakeholder Link */}
                                    {item.stakeholderName && (
                                      <Badge variant="outline" className="text-xs">
                                        <Users className="w-3 h-3 mr-1" />
                                        {item.stakeholderName}
                                      </Badge>
                                    )}
                                    
                                    {/* Clickable Source */}
                                    {item.sourceType && item.sourceType !== 'manual' && sourceTabMap[item.sourceType] && (
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const tab = sourceTabMap[item.sourceType];
                                          if (tab) setActiveTab(tab);
                                        }}
                                        data-testid={`link-source-${item.id}`}
                                      >
                                        <Link2 className="w-3 h-3 mr-1" />
                                        {sourceLabels[item.sourceType] || item.sourceType.replace(/_/g, ' ')}
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                      </Button>
                                    )}
                                    {item.sourceType && item.sourceType !== 'manual' && !sourceTabMap[item.sourceType] && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Link2 className="w-3 h-3 mr-1" />
                                        {sourceLabels[item.sourceType] || item.sourceType.replace(/_/g, ' ')}
                                      </Badge>
                                    )}
                                    
                                    {/* AI Badge */}
                                    {(item.sourceKind === 'ai' || item.sourceType === 'ai_generated') && (
                                      <Badge className="text-xs bg-purple-500/10 text-purple-700 border-purple-500/20">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        AI
                                      </Badge>
                                    )}
                                    
                                    {/* Status Badge */}
                                    {item.itemStatus && item.itemStatus !== 'draft' && (
                                      <Badge className={`text-xs ${itemStatusCfg.color}`}>
                                        {itemStatusCfg.label}
                                      </Badge>
                                    )}
                                    
                                    {/* Evidence Phase Badge */}
                                    {item.evidencePhase && journeyPhaseConfig[item.evidencePhase] && (
                                      <Badge variant="outline" className={`text-xs ${journeyPhaseConfig[item.evidencePhase].color}`}>
                                        {journeyPhaseConfig[item.evidencePhase].label.split(' ')[0]}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* What This Proves - Journey Context */}
                                  {item.content?.whatThisProves && (
                                    <p className="text-xs text-muted-foreground mt-1.5 pl-0 italic border-l-2 border-amber-500/30 ml-1 pl-2">
                                      {item.content.whatThisProves}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateItemStatusMutation.mutate({ itemId: item.id, status: 'validated' })}
                                    disabled={item.itemStatus === 'validated'}
                                    title="Validate"
                                    data-testid={`button-validate-${item.id}`}
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateItemStatusMutation.mutate({ itemId: item.id, status: 'flagged' })}
                                    disabled={item.itemStatus === 'flagged'}
                                    title="Flag for Review"
                                    data-testid={`button-flag-${item.id}`}
                                  >
                                    <Flag className="w-4 h-4 text-orange-500" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setPreviewItem(item)}
                                    title="View Details"
                                    data-testid={`button-preview-${item.id}`}
                                  >
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteItemMutation.mutate(item.id)}
                                    title="Delete"
                                    data-testid={`button-delete-item-${item.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      </div>
                      
                      {/* Story Thread Arrow to Next Phase */}
                      {hasNextPhase && (
                        <div className="flex items-center justify-center py-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Leads to</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Floating Bulk Action Bar */}
        {selectedItems.size > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border shadow-lg rounded-lg p-3 flex items-center gap-3" data-testid="bulk-action-bar">
            <span className="text-sm font-medium">{selectedItems.size} selected</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkUpdateStatusMutation.mutate({ itemIds: Array.from(selectedItems), status: 'validated' })}
                disabled={bulkUpdateStatusMutation.isPending}
                data-testid="button-bulk-validate"
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                Validate All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkUpdateStatusMutation.mutate({ itemIds: Array.from(selectedItems), status: 'flagged' })}
                disabled={bulkUpdateStatusMutation.isPending}
                data-testid="button-bulk-flag"
              >
                <Flag className="w-4 h-4 mr-1 text-orange-500" />
                Flag All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkDeleteMutation.mutate(Array.from(selectedItems))}
                disabled={bulkDeleteMutation.isPending}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedItems(new Set())}
                data-testid="button-clear-selection"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Preview Drawer/Sheet */}
        <Sheet open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <SheetContent className="overflow-y-auto" data-testid="preview-drawer">
            {previewItem && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = itemTypeIcons[previewItem.itemType] || Target;
                      return <Icon className="w-5 h-5 text-amber-600" />;
                    })()}
                    <span className="capitalize">{previewItem.itemType?.replace(/_/g, ' ')}</span>
                  </SheetTitle>
                  <SheetDescription>
                    Full details and provenance tracking
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Claim */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Claim</Label>
                    <p className="mt-1 text-sm font-medium">{previewItem.claim}</p>
                  </div>
                  
                  {/* Evidence/Supporting Details */}
                  {previewItem.evidence && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Evidence</Label>
                      <p className="mt-1 text-sm">{previewItem.evidence}</p>
                    </div>
                  )}
                  
                  {/* Journey Context - Where this fits in the story */}
                  {previewItem.evidencePhase && journeyPhaseConfig[previewItem.evidencePhase] && (
                    <div className={`p-3 rounded-lg ${journeyPhaseConfig[previewItem.evidencePhase].bgColor}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const PhaseIcon = journeyPhaseConfig[previewItem.evidencePhase].icon;
                          return <PhaseIcon className={`w-4 h-4 ${journeyPhaseConfig[previewItem.evidencePhase].color}`} />;
                        })()}
                        <span className={`text-sm font-medium ${journeyPhaseConfig[previewItem.evidencePhase].color}`}>
                          {journeyPhaseConfig[previewItem.evidencePhase].label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        {journeyPhaseConfig[previewItem.evidencePhase].narrative}
                      </p>
                    </div>
                  )}
                  
                  {/* What This Proves */}
                  {previewItem.content?.whatThisProves && (
                    <div className="p-3 border-l-4 border-amber-500 bg-amber-500/5 rounded-r-lg">
                      <Label className="text-xs text-amber-700 dark:text-amber-400 font-semibold">What This Proves</Label>
                      <p className="mt-1 text-sm">{previewItem.content.whatThisProves}</p>
                    </div>
                  )}
                  
                  {/* Status & Pillars */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge className={`mt-1 ${(itemStatusConfig[previewItem.itemStatus] || itemStatusConfig.draft).color}`}>
                        {(itemStatusConfig[previewItem.itemStatus] || itemStatusConfig.draft).label}
                      </Badge>
                    </div>
                    {previewItem.valuePillar && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Value Pillar</Label>
                        <Badge className={`mt-1 ${valuePillarConfig[previewItem.valuePillar]?.bgColor || ''}`}>
                          {valuePillarConfig[previewItem.valuePillar]?.label || previewItem.valuePillar}
                        </Badge>
                      </div>
                    )}
                    {previewItem.evidencePhase && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Journey Phase</Label>
                        <Badge variant="outline" className={`mt-1 ${journeyPhaseConfig[previewItem.evidencePhase]?.color || ''}`}>
                          {journeyPhaseConfig[previewItem.evidencePhase]?.label.split(' ')[0] || previewItem.evidencePhase}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Trust Velocity Indicators */}
                  {(previewItem.content?.successFrameClarity || previewItem.content?.methodAdherence || previewItem.content?.sponsorAlignment !== undefined) && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <Label className="text-xs text-muted-foreground mb-2 block">Trust Velocity Indicators</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {previewItem.content?.successFrameClarity && (
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span className="text-xs">Success Frame: <span className="font-medium capitalize">{previewItem.content.successFrameClarity}</span></span>
                          </div>
                        )}
                        {previewItem.content?.methodAdherence && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-amber-500" />
                            <span className="text-xs">Discipline: <span className="font-medium capitalize">{previewItem.content.methodAdherence}</span></span>
                          </div>
                        )}
                        {previewItem.content?.sponsorAlignment !== undefined && (
                          <div className="flex items-center gap-2">
                            {previewItem.content.sponsorAlignment ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-yellow-500" />}
                            <span className="text-xs">Sponsor Aligned: <span className="font-medium">{previewItem.content.sponsorAlignment ? 'Yes' : 'Pending'}</span></span>
                          </div>
                        )}
                        {previewItem.content?.handoffCompleteness && (
                          <div className="flex items-center gap-2">
                            <Handshake className="w-3 h-3 text-purple-500" />
                            <span className="text-xs">Handoff: <span className="font-medium">{previewItem.content.handoffCompleteness}%</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                    {previewItem.audienceScope && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Audience</Label>
                        <p className="text-sm capitalize">{previewItem.audienceScope}</p>
                      </div>
                    )}
                    {previewItem.skillDomain && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Skill Domain</Label>
                        <p className="text-sm capitalize">{previewItem.skillDomain.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    {previewItem.metricValue && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Metric Value</Label>
                        <p className="text-sm">{previewItem.metricValue} {previewItem.metricUnit || ''}</p>
                      </div>
                    )}
                    {previewItem.confidence && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Confidence</Label>
                        <p className="text-sm">{Math.round(previewItem.confidence * 100)}%</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Provenance Section */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Provenance</Label>
                    <div className="p-3 border rounded-lg bg-blue-500/5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Source Type</span>
                        <span className="font-medium capitalize">{previewItem.sourceType?.replace(/_/g, ' ') || 'Manual'}</span>
                      </div>
                      {previewItem.sourceId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Source ID</span>
                          <span className="font-mono text-xs">{previewItem.sourceId}</span>
                        </div>
                      )}
                      {previewItem.sourceKind && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Source Kind</span>
                          <Badge variant="outline" className="text-xs capitalize">{previewItem.sourceKind}</Badge>
                        </div>
                      )}
                      {previewItem.provenance && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Raw Provenance Data</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(previewItem.provenance, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => updateItemStatusMutation.mutate({ itemId: previewItem.id, status: 'validated' })}
                      disabled={previewItem.itemStatus === 'validated' || updateItemStatusMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Validate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateItemStatusMutation.mutate({ itemId: previewItem.id, status: 'flagged' })}
                      disabled={previewItem.itemStatus === 'flagged' || updateItemStatusMutation.isPending}
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      Flag
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        deleteItemMutation.mutate(previewItem.id);
                        setPreviewItem(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
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
      growth_accelerator: 0, // Growth Accelerator progress - will be calculated from canvas completion
      strategy: 0, // Blue Sheet completion - will be calculated from blueSheet data
      align: hasConfirmedCommitments ? 100 : (hasCommitments ? 50 : 0),
      handoff: hasHandoffs ? 100 : (hasConfirmedCommitments ? 50 : 0),
      evidence: 0, // Evidence pack progress - will be calculated from evidence pack data
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
            { id: "growth_accelerator", label: "Growth Accelerator", icon: Rocket, progress: workflowProgress.growth_accelerator || 0, description: "Sales Play Builder", isGrowthAccelerator: true },
            { id: "strategy", label: "Strategy Synthesis", icon: FileText, progress: workflowProgress.strategy, description: "Auto-Generated Blue Sheet", isSynthesis: true },
            { id: "handoff", label: "Handoff", icon: ArrowUpRight, progress: workflowProgress.handoff, description: "Transition to Delivery" },
            { id: "evidence", label: "Evidence Pack", icon: Briefcase, progress: workflowProgress.evidence, description: "Claims & Proof Points", isEvidence: true },
          ].map((stage, idx) => {
            const isActive = activeTab === stage.id;
            const isComplete = stage.progress === 100;
            const StageIcon = stage.icon;
            
            const isSynthesis = (stage as any).isSynthesis;
            const isEvidence = (stage as any).isEvidence;
            const isGrowthAccelerator = (stage as any).isGrowthAccelerator;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveTab(stage.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isActive 
                    ? "bg-primary/10 border-primary/30 shadow-sm" 
                    : isGrowthAccelerator
                      ? "bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20 hover-elevate"
                      : isSynthesis
                        ? "bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20 hover-elevate"
                        : isEvidence
                          ? "bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20 hover-elevate"
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
                        : isGrowthAccelerator
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600"
                          : isSynthesis
                            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-600"
                            : isEvidence
                              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600"
                              : "bg-muted text-muted-foreground"
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : isGrowthAccelerator ? <Rocket className="w-4 h-4" /> : isSynthesis ? <Brain className="w-4 h-4" /> : <StageIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>{stage.label}</p>
                      {isGrowthAccelerator && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                          Play
                        </Badge>
                      )}
                      {isSynthesis && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-purple-500/30 text-purple-600 bg-purple-500/5">
                          AI
                        </Badge>
                      )}
                      {isEvidence && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-amber-500/30 text-amber-600 bg-amber-500/5">
                          Proof
                        </Badge>
                      )}
                    </div>
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

          <Link href={`/presentation-studio/${accountId}/${projectId}`} data-testid="nav-presentation-studio">
            <div className="w-full text-left p-3 rounded-lg border transition-all bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20 hover-elevate">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600">
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium">Presentation Studio</p>
                    <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-500/30 text-blue-600 bg-blue-500/5">
                      AI
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Generate Client Decks</p>
                </div>
              </div>
            </div>
          </Link>
          
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Tab Navigation */}
          <TabsList className="grid grid-cols-6 w-full lg:hidden">
            <TabsTrigger value="discover" data-testid="tab-discover">
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="align" data-testid="tab-align">
              <Target className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Outcomes</span>
            </TabsTrigger>
            <TabsTrigger value="growth_accelerator" data-testid="tab-growth-accelerator" className="relative">
              <Rocket className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Sales Play</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" data-testid="tab-strategy" className="relative">
              <Brain className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="handoff" data-testid="tab-handoff">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Handoff</span>
            </TabsTrigger>
            <TabsTrigger value="evidence" data-testid="tab-evidence">
              <Briefcase className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Evidence</span>
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
                        onClick={() => setShowExportDialog(true)}
                        className="gap-1"
                        data-testid="button-export-report"
                      >
                        <FileText className="w-3 h-3" />
                        Export Report
                      </Button>
                      <ExportOptionsDialog
                        open={showExportDialog}
                        onOpenChange={setShowExportDialog}
                        companyName={project.companyName}
                        onExport={(format, options) => {
                          if (!liveIntelligence) return;
                          const exportData: IntelligenceExportData = {
                            companyName: project.companyName || "Company",
                            industry: liveIntelligence.companyOverview?.industry,
                            theme: selectedDiscoveryTheme || undefined,
                            executiveSummary: liveIntelligence.companyOverview?.description,
                            insights: liveIntelligence.strategicInsights?.map((insight: any) => ({
                              title: insight.title || insight.category || "Insight",
                              value: insight.insight || insight.description || "",
                              category: insight.category,
                              priority: insight.priority
                            })) || [],
                            annualReportSummary: liveIntelligence.annualReportSummary ? {
                              ...liveIntelligence.annualReportSummary,
                              reportUrl: liveIntelligence.annualReportSummary.source
                            } : undefined,
                            earningsCallHighlights: liveIntelligence.earningsCallHighlights ? {
                              ...liveIntelligence.earningsCallHighlights,
                              transcriptUrl: liveIntelligence.earningsCallHighlights.source
                            } : undefined,
                            meetingAttendees: meetingAttendees.map(a => ({
                              name: a.name,
                              title: a.title,
                              role: a.role,
                              influence: a.influence,
                              affiliation: a.affiliation
                            })),
                            greenSheet: {
                              objective: greenSheetEdits.objective,
                              desiredOutcome: greenSheetEdits.desiredOutcome,
                              openingStatement: greenSheetEdits.openingStatement,
                              bestActionCommitment: greenSheetEdits.bestActionCommitment
                            },
                            discoveryQuestions: myCallFlow.map(q => ({
                              question: q.question,
                              answer: questionAnswers[q.id] || "",
                              methodology: q.methodology
                            })),
                            storyCoaching: storyBuilderData ? {
                              keyMessage: storyBuilderData.before?.singleMessage || "",
                              emotionalGoal: storyBuilderData.before?.emotionalReaction || "",
                              openingHook: storyBuilderData.before?.startingHook || "",
                              turningPoint: storyBuilderData.during?.turningPoint || "",
                              callToAction: storyBuilderData.after?.callToAction || "",
                              tensionQuestions: (storyBuilderData.before?.tensionQuestions || []).map(q => ({
                                prompt: q.prompt,
                                response: q.response,
                                methodology: q.methodology
                              }))
                            } : undefined,
                            companyWebsite: liveIntelligence.companyOverview?.website,
                            reportUrl: liveIntelligence.annualReportSummary?.source,
                            transcriptUrl: liveIntelligence.earningsCallHighlights?.source,
                            linkedInUrl: meetingAttendees.find(a => a.linkedInUrl)?.linkedInUrl,
                            externalLinks: [
                              liveIntelligence.companyOverview?.website ? { label: "Company Website", url: liveIntelligence.companyOverview.website } : null,
                              liveIntelligence.annualReportSummary?.source ? { label: "Annual Report", url: liveIntelligence.annualReportSummary.source } : null,
                              liveIntelligence.earningsCallHighlights?.source ? { label: "Earnings Call", url: liveIntelligence.earningsCallHighlights.source } : null
                            ].filter(Boolean) as Array<{label: string; url: string}>
                          };
                          if (format === "ppt") {
                            generateIntelligencePPT(exportData, options);
                          } else {
                            generateIntelligencePDF(exportData, options);
                          }
                        }}
                      />
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

              {/* Annual Report Summary */}
              {liveIntelligence.annualReportSummary && (
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent" data-testid="card-annual-report">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Annual Report Summary</CardTitle>
                        <CardDescription>{liveIntelligence.annualReportSummary.fiscalYear} • {liveIntelligence.annualReportSummary.source}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* CEO Letter Highlights */}
                    {liveIntelligence.annualReportSummary.ceoLetterHighlights?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Quote className="w-4 h-4 text-amber-600" />
                          CEO Letter Highlights
                        </h4>
                        <ul className="space-y-2">
                          {liveIntelligence.annualReportSummary.ceoLetterHighlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm p-2 rounded bg-amber-500/5 border border-amber-500/20 italic">
                              "{highlight}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strategic Priorities */}
                    {liveIntelligence.annualReportSummary.strategicPriorities?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-600" />
                          Strategic Priorities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {liveIntelligence.annualReportSummary.strategicPriorities.map((priority, idx) => (
                            <Badge key={idx} variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                              {priority}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* People Metrics */}
                    {liveIntelligence.annualReportSummary.peopleMetrics && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-600" />
                          People & Talent Metrics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {liveIntelligence.annualReportSummary.peopleMetrics.headcount && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Headcount</p>
                              <p className="text-sm font-medium">{liveIntelligence.annualReportSummary.peopleMetrics.headcount}</p>
                            </div>
                          )}
                          {liveIntelligence.annualReportSummary.peopleMetrics.turnover && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Turnover</p>
                              <p className="text-sm font-medium">{liveIntelligence.annualReportSummary.peopleMetrics.turnover}</p>
                            </div>
                          )}
                          {liveIntelligence.annualReportSummary.peopleMetrics.diversity && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Diversity</p>
                              <p className="text-sm font-medium">{liveIntelligence.annualReportSummary.peopleMetrics.diversity}</p>
                            </div>
                          )}
                          {liveIntelligence.annualReportSummary.peopleMetrics.engagement && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Engagement</p>
                              <p className="text-sm font-medium">{liveIntelligence.annualReportSummary.peopleMetrics.engagement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {liveIntelligence.annualReportSummary.riskFactors?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          People-Related Risk Factors
                        </h4>
                        <ul className="space-y-1">
                          {liveIntelligence.annualReportSummary.riskFactors.map((risk, idx) => (
                            <li key={idx} className="text-sm p-2 rounded bg-red-500/5 border border-red-500/20 text-red-700">
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Earnings Call Highlights */}
              {liveIntelligence.earningsCallHighlights && (
                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent" data-testid="card-earnings-call">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Earnings Call Highlights</CardTitle>
                        <CardDescription>{liveIntelligence.earningsCallHighlights.quarter} • {liveIntelligence.earningsCallHighlights.source}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Executive Commentary */}
                    {liveIntelligence.earningsCallHighlights.executiveCommentary?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Quote className="w-4 h-4 text-blue-600" />
                          Executive Commentary
                        </h4>
                        <ul className="space-y-2">
                          {liveIntelligence.earningsCallHighlights.executiveCommentary.map((quote, idx) => (
                            <li key={idx} className="text-sm p-3 rounded bg-blue-500/5 border border-blue-500/20 italic">
                              "{quote}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Workforce Discussions */}
                    {liveIntelligence.earningsCallHighlights.workforceDiscussions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Workforce & Talent Discussions
                        </h4>
                        <ul className="space-y-2">
                          {liveIntelligence.earningsCallHighlights.workforceDiscussions.map((discussion, idx) => (
                            <li key={idx} className="text-sm p-2 rounded bg-blue-500/5 border border-blue-500/20">
                              {discussion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Future Outlook */}
                    {liveIntelligence.earningsCallHighlights.futureOutlook && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Forward-Looking Outlook
                        </h4>
                        <p className="text-sm p-3 rounded bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                          {liveIntelligence.earningsCallHighlights.futureOutlook}
                        </p>
                      </div>
                    )}

                    {/* Analyst Q&A */}
                    {liveIntelligence.earningsCallHighlights.analystQuestions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          Analyst Q&A Topics
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {liveIntelligence.earningsCallHighlights.analystQuestions.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
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
                          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3 bg-background">
                            {probeHistory.map((msg, idx) => (
                              <div key={idx}>
                                <div 
                                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div 
                                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                      msg.role === "user" 
                                        ? "bg-purple-600 text-white" 
                                        : savedToContext.has(idx) 
                                          ? "bg-emerald-500/10 border border-emerald-500/30" 
                                          : "bg-muted"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <div className="flex items-center justify-between mt-1 gap-2">
                                      <p className="text-xs opacity-60">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                      </p>
                                      {msg.role === "assistant" && savedToContext.has(idx) && (
                                        <Badge className="text-xs bg-emerald-500/20 text-emerald-700">
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          In AI Context
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Context prompt for assistant responses */}
                                {msg.role === "assistant" && showContextPrompt === idx && !savedToContext.has(idx) && (
                                  <div className="mt-2 ml-0 p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">Add this insight to AI Context?</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          This will help the AI provide better coaching and recommendations throughout your engagement.
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              const questionIdx = idx - 1;
                                              const question = probeHistory[questionIdx]?.content || "";
                                              setSavingToContext(idx);
                                              saveToContextMutation.mutate({ question, answer: msg.content });
                                            }}
                                            disabled={savingToContext === idx}
                                            data-testid={`button-add-context-${idx}`}
                                          >
                                            {savingToContext === idx ? (
                                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                              <Plus className="w-4 h-4 mr-1" />
                                            )}
                                            Yes, Add to Context
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowContextPrompt(null)}
                                            data-testid={`button-skip-context-${idx}`}
                                          >
                                            Skip
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Add to context button for past responses */}
                                {msg.role === "assistant" && showContextPrompt !== idx && !savedToContext.has(idx) && (
                                  <div className="mt-1 ml-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-xs text-muted-foreground hover:text-purple-600"
                                      onClick={() => setShowContextPrompt(idx)}
                                      data-testid={`button-show-context-prompt-${idx}`}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add to AI Context
                                    </Button>
                                  </div>
                                )}
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

            {/* Pre-Meeting Materials - Positioned above Green Sheet for AI enrichment flow */}
            <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                        Pre-Meeting Materials
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">AI Context</Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Upload documents to power AI suggestions for your Green Sheet below
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ArtifactUpload
                  projectId={projectId}
                  meetingContext="pre_meeting"
                  title=""
                  description="Upload call transcripts, research documents, emails, or notes. AI will analyze these to suggest Green Sheet content."
                  compact={true}
                />
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>After uploading, use the "Enrich from Docs" button in the Green Sheet below</span>
                </div>
              </CardContent>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            enrichFromDocumentsMutation.mutate();
                          }}
                          disabled={enrichFromDocumentsMutation.isPending}
                          className="gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          data-testid="button-enrich-from-documents"
                        >
                          {enrichFromDocumentsMutation.isPending ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                          ) : (
                            <><FileText className="w-3.5 h-3.5" /> Enrich from Docs</>
                          )}
                        </Button>
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
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-emerald-800">
                          <Users className="w-5 h-5" />
                          Meeting Attendees ({meetingAttendees.length})
                          {meetingAttendees.length > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">
                              ({meetingAttendees.filter(a => (a.affiliation || "client") === "client").length} Client
                              {meetingAttendees.filter(a => a.affiliation === "internal").length > 0 && 
                                ` • ${meetingAttendees.filter(a => a.affiliation === "internal").length} Internal`})
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2">
                          {meetingAttendees.filter(a => (a.affiliation || "client") === "client").length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-purple-600 border-purple-500/30"
                              onClick={() => researchAttendeesMutation.mutate()}
                              disabled={researchAttendeesMutation.isPending}
                              data-testid="button-research-attendees"
                            >
                              {researchAttendeesMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5" />
                              )}
                              {researchAttendeesMutation.isPending ? "Researching..." : "Research Attendees"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-emerald-600 border-emerald-500/30"
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
                      </div>

                      {/* Attendee List - sorted with clients first */}
                      {meetingAttendees.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground" data-testid="empty-attendees-state">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No attendees added yet</p>
                          <p className="text-xs mt-1">Add stakeholders to generate a combined meeting story</p>
                        </div>
                      ) : (
                        <div className="space-y-3" data-testid="attendees-list">
                          {[...meetingAttendees]
                            .sort((a, b) => {
                              // Sort: clients first, then internal
                              const aIsClient = (a.affiliation || "client") === "client";
                              const bIsClient = (b.affiliation || "client") === "client";
                              if (aIsClient && !bIsClient) return -1;
                              if (!aIsClient && bIsClient) return 1;
                              return 0;
                            }).map((attendee, displayIndex) => {
                            // Use the stable ID for all operations
                            const attendeeId = attendee.id!;
                            const isExpanded = expandedAttendeeIds.has(attendeeId);
                            const hasResearch = attendee.aiResearch && attendee.aiResearch.researchedAt;
                            
                            return (
                            <div
                              key={attendeeId}
                              className={`rounded-lg border overflow-hidden ${
                                (attendee.affiliation || "client") === "internal" 
                                  ? "bg-blue-50 border-blue-200" 
                                  : "bg-white"
                              }`}
                              data-testid={`card-attendee-${displayIndex}`}
                            >
                              {/* Attendee Header */}
                              <div className="p-3 flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="font-medium text-sm" data-testid={`text-attendee-name-${displayIndex}`}>{attendee.name}</div>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] ${
                                        (attendee.affiliation || "client") === "internal"
                                          ? "bg-blue-100 text-blue-700 border-blue-300"
                                          : "bg-emerald-100 text-emerald-700 border-emerald-300"
                                      }`}
                                      data-testid={`badge-attendee-affiliation-${displayIndex}`}
                                    >
                                      {(attendee.affiliation || "client") === "internal" ? "Internal" : "Client"}
                                    </Badge>
                                    {hasResearch && (
                                      <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-700 border-purple-300" data-testid={`badge-attendee-researched-${displayIndex}`}>
                                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                        Researched
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground" data-testid={`text-attendee-title-${displayIndex}`}>{attendee.title}</div>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <Badge variant="secondary" className="text-xs" data-testid={`badge-attendee-role-${displayIndex}`}>
                                      {attendee.role?.replace("_", " ") || "Unknown Role"}
                                    </Badge>
                                    {(attendee.affiliation || "client") === "client" && attendee.influence && (
                                      <Badge variant="outline" className="text-xs" data-testid={`badge-attendee-influence-${displayIndex}`}>
                                        {attendee.influence} Influence
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {hasResearch && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        setExpandedAttendeeIds(prev => {
                                          const next = new Set(prev);
                                          if (next.has(attendeeId)) {
                                            next.delete(attendeeId);
                                          } else {
                                            next.add(attendeeId);
                                          }
                                          return next;
                                        });
                                      }}
                                      data-testid={`button-toggle-research-${displayIndex}`}
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      // Pass the full attendee with its stable ID for editing
                                      setEditingAttendee({ ...attendee });
                                      setShowAddAttendeeDialog(true);
                                    }}
                                    data-testid={`button-edit-attendee-${displayIndex}`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500"
                                    onClick={() => {
                                      // Delete by stable ID
                                      setMeetingAttendees(prev => prev.filter(a => a.id !== attendeeId));
                                    }}
                                    data-testid={`button-remove-attendee-${displayIndex}`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Expanded Research Panel - Visual Card Layout */}
                              {isExpanded && attendee.aiResearch && (
                                <div className="px-3 pb-3 border-t border-purple-200 bg-gradient-to-b from-purple-50/50 to-white" data-testid={`panel-research-${displayIndex}`}>
                                  <div className="pt-3 space-y-3">
                                    {/* Quick Insights Bar - Visual Summary */}
                                    <div className="flex flex-wrap gap-1.5">
                                      {attendee.aiResearch.keyPriorities && attendee.aiResearch.keyPriorities.length > 0 && (
                                        <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 text-[10px] gap-1">
                                          <Target className="w-2.5 h-2.5" />
                                          {attendee.aiResearch.keyPriorities.length} Priorities
                                        </Badge>
                                      )}
                                      {attendee.aiResearch.questionsToAsk && attendee.aiResearch.questionsToAsk.length > 0 && (
                                        <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-[10px] gap-1">
                                          <HelpCircle className="w-2.5 h-2.5" />
                                          {attendee.aiResearch.questionsToAsk.length} Questions
                                        </Badge>
                                      )}
                                      {attendee.aiResearch.rapportBuildingTips && attendee.aiResearch.rapportBuildingTips.length > 0 && (
                                        <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-[10px] gap-1">
                                          <Heart className="w-2.5 h-2.5" />
                                          {attendee.aiResearch.rapportBuildingTips.length} Tips
                                        </Badge>
                                      )}
                                      {attendee.aiResearch.redFlags && attendee.aiResearch.redFlags.length > 0 && (
                                        <Badge variant="outline" className="bg-red-50 border-red-200 text-red-600 text-[10px] gap-1">
                                          <AlertTriangle className="w-2.5 h-2.5" />
                                          {attendee.aiResearch.redFlags.length} Cautions
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Role Context - Compact Card */}
                                    {attendee.aiResearch.roleContext && (
                                      <div className="p-2 rounded-md bg-white border border-purple-100 flex gap-2">
                                        <Briefcase className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">{attendee.aiResearch.roleContext}</p>
                                      </div>
                                    )}
                                    
                                    {/* 2-Column Visual Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {/* Key Priorities Card */}
                                      {attendee.aiResearch.keyPriorities && attendee.aiResearch.keyPriorities.length > 0 && (
                                        <div className="p-2 rounded-md bg-purple-50/80 border border-purple-100">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                                              <Target className="w-3 h-3 text-purple-600" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Priorities</span>
                                          </div>
                                          <div className="space-y-1">
                                            {attendee.aiResearch.keyPriorities.slice(0, 3).map((priority, i) => (
                                              <div key={i} className="flex items-start gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                                                <span className="text-[11px] text-purple-900 leading-tight line-clamp-2">{priority}</span>
                                              </div>
                                            ))}
                                            {attendee.aiResearch.keyPriorities.length > 3 && (
                                              <span className="text-[10px] text-purple-500 pl-3">+{attendee.aiResearch.keyPriorities.length - 3} more</span>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Rapport Tips Card */}
                                      {attendee.aiResearch.rapportBuildingTips && attendee.aiResearch.rapportBuildingTips.length > 0 && (
                                        <div className="p-2 rounded-md bg-emerald-50/80 border border-emerald-100">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                              <Heart className="w-3 h-3 text-emerald-600" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Rapport</span>
                                          </div>
                                          <div className="space-y-1">
                                            {attendee.aiResearch.rapportBuildingTips.slice(0, 3).map((tip, i) => (
                                              <div key={i} className="flex items-start gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                                <span className="text-[11px] text-emerald-900 leading-tight line-clamp-2">{tip}</span>
                                              </div>
                                            ))}
                                            {attendee.aiResearch.rapportBuildingTips.length > 3 && (
                                              <span className="text-[10px] text-emerald-500 pl-3">+{attendee.aiResearch.rapportBuildingTips.length - 3} more</span>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Questions Card */}
                                      {attendee.aiResearch.questionsToAsk && attendee.aiResearch.questionsToAsk.length > 0 && (
                                        <div className="p-2 rounded-md bg-amber-50/80 border border-amber-100">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                                              <HelpCircle className="w-3 h-3 text-amber-600" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Ask</span>
                                          </div>
                                          <div className="space-y-1">
                                            {attendee.aiResearch.questionsToAsk.slice(0, 2).map((q, i) => (
                                              <div key={i} className="flex items-start gap-1.5">
                                                <span className="text-amber-500 text-[11px] font-bold shrink-0">?</span>
                                                <span className="text-[11px] text-amber-900 leading-tight line-clamp-2">{q}</span>
                                              </div>
                                            ))}
                                            {attendee.aiResearch.questionsToAsk.length > 2 && (
                                              <span className="text-[10px] text-amber-500 pl-3">+{attendee.aiResearch.questionsToAsk.length - 2} more</span>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Messaging Card */}
                                      {attendee.aiResearch.messagingThatResonates && attendee.aiResearch.messagingThatResonates.length > 0 && (
                                        <div className="p-2 rounded-md bg-blue-50/80 border border-blue-100">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                              <MessageCircle className="w-3 h-3 text-blue-600" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Messaging</span>
                                          </div>
                                          <div className="space-y-1">
                                            {attendee.aiResearch.messagingThatResonates.slice(0, 2).map((msg, i) => (
                                              <div key={i} className="flex items-start gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                                                <span className="text-[11px] text-blue-900 leading-tight line-clamp-2">{msg}</span>
                                              </div>
                                            ))}
                                            {attendee.aiResearch.messagingThatResonates.length > 2 && (
                                              <span className="text-[10px] text-blue-500 pl-3">+{attendee.aiResearch.messagingThatResonates.length - 2} more</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Red Flags - Highlighted Warning */}
                                    {attendee.aiResearch.redFlags && attendee.aiResearch.redFlags.length > 0 && (
                                      <div className="p-2 rounded-md bg-red-50 border border-red-200 flex gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                        <div className="flex flex-wrap gap-1">
                                          {attendee.aiResearch.redFlags.map((flag, i) => (
                                            <Badge key={i} variant="outline" className="bg-white border-red-200 text-red-700 text-[10px]">
                                              {flag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Story Angle - Featured Insight */}
                                    {attendee.aiResearch.storyAngle && (
                                      <div className="p-2.5 rounded-md bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                          <Lightbulb className="w-3.5 h-3.5 text-purple-700" />
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Story Angle</span>
                                          <p className="text-[11px] text-purple-900 mt-0.5 leading-relaxed">{attendee.aiResearch.storyAngle}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Researched timestamp */}
                                    {attendee.aiResearch.researchedAt && (
                                      <div className="text-[10px] text-muted-foreground pt-1 border-t flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                        AI researched {new Date(attendee.aiResearch.researchedAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                          })}
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

            {/* Story Coach - Interactive Coaching Experience */}
            <StoryCoach
              storyBuilderData={storyBuilderData}
              setStoryBuilderData={setStoryBuilderData}
              companyName={project?.companyName}
              isSaving={saveStoryBuilderMutation.isPending}
              lastSaved={storyBuilderLastSaved}
              onAiSuggest={(field, stories) => handleAiSuggestWithStories(field, stories)}
              onGenerateAll={handleGenerateAllPhase}
              onRefineStory={handleRefineStory}
              aiSuggestionLoading={aiSuggestionLoading}
              onVoiceInput={(field) => { setVoiceTargetField(field); setIsVoiceCommandOpen(true); }}
              onExport={handleExportStory}
              refineResult={storyRefineResult}
              onOpenTensionQuestions={() => setTensionQuestionsDialogOpen(true)}
              tensionQuestions={storyBuilderData.before.tensionQuestions}
              onRemoveTensionQuestion={(id) => {
                setStoryBuilderData(prev => ({
                  ...prev,
                  before: {
                    ...prev.before,
                    tensionQuestions: prev.before.tensionQuestions.filter(q => q.id !== id)
                  }
                }));
              }}
              onUpdateTensionQuestionResponse={(id, response) => {
                setStoryBuilderData(prev => ({
                  ...prev,
                  before: {
                    ...prev.before,
                    tensionQuestions: prev.before.tensionQuestions.map(q => 
                      q.id === id ? { ...q, response } : q
                    )
                  }
                }));
              }}
              onFindSuccessStories={async () => {
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
              isLoadingStories={isGeneratingStories}
              suggestedStories={suggestedStories}
              onSelectStory={(story) => {
                setStoryBuilderData(prev => ({ 
                  ...prev, 
                  before: { 
                    ...prev.before, 
                    evidenceToReference: `${story.title}: ${story.outcome}` 
                  }
                }));
                toast({ title: "Story added to Evidence" });
              }}
              projectId={projectId}
              discoveryTheme={selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : undefined}
              greenSheet={greenSheetEdits ? {
                objective: greenSheetEdits.objective || undefined,
                desiredOutcome: greenSheetEdits.desiredOutcome || undefined,
                openingStatement: greenSheetEdits.openingStatement || undefined
              } : undefined}
              meetingAttendees={meetingAttendees || []}
            />

            {/* Story Test - Validate Your Story */}
            <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Story Test</CardTitle>
                      <CardDescription>Validate your story before the meeting</CardDescription>
                    </div>
                  </div>
                  {(() => {
                    const scores = [
                      storyBuilderData.storyTest.strangerCareScore,
                      storyBuilderData.storyTest.simplicityScore,
                      storyBuilderData.storyTest.leadershipValuesScore
                    ].filter(s => s !== null) as number[];
                    if (scores.length === 0) return null;
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    return (
                      <Badge className={avg >= 4 ? "bg-emerald-500" : avg >= 3 ? "bg-amber-500" : "bg-red-500"}>
                        {avg >= 4 ? "Ready!" : avg >= 3 ? "Almost" : "Needs Work"}
                      </Badge>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Test 1: Stranger Care */}
                  <div className="p-4 rounded-lg border bg-card">
                    <Label className="font-medium mb-2 block text-sm">Would a stranger care?</Label>
                    <p className="text-xs text-muted-foreground mb-3">If not, sharpen the tension or emotional core.</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(score => (
                        <Button
                          key={score}
                          size="sm"
                          variant={storyBuilderData.storyTest.strangerCareScore === score ? "default" : "outline"}
                          className="h-8 w-8 p-0"
                          onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, strangerCareScore: score } }))}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Test 2: Simplicity */}
                  <div className="p-4 rounded-lg border bg-card">
                    <Label className="font-medium mb-2 block text-sm">Is it simple enough?</Label>
                    <p className="text-xs text-muted-foreground mb-3">Can you tell it in 60 seconds?</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(score => (
                        <Button
                          key={score}
                          size="sm"
                          variant={storyBuilderData.storyTest.simplicityScore === score ? "default" : "outline"}
                          className="h-8 w-8 p-0"
                          onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, simplicityScore: score } }))}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Test 3: Leadership Values */}
                  <div className="p-4 rounded-lg border bg-card">
                    <Label className="font-medium mb-2 block text-sm">Does it reveal values?</Label>
                    <p className="text-xs text-muted-foreground mb-3">What lesson does it teach about leadership?</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(score => (
                        <Button
                          key={score}
                          size="sm"
                          variant={storyBuilderData.storyTest.leadershipValuesScore === score ? "default" : "outline"}
                          className="h-8 w-8 p-0"
                          onClick={() => setStoryBuilderData(prev => ({ ...prev, storyTest: { ...prev.storyTest, leadershipValuesScore: score } }))}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Practice Button */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Rate 1-5: 1 = Needs work, 5 = Excellent</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 border-blue-500/30 text-blue-600"
                    onClick={() => {
                      window.open("https://yoodli.ai", "_blank");
                      toast({ title: "Opening Yoodli", description: "Practice your story delivery with AI speech coaching" });
                    }}
                    data-testid="button-practice-yoodli-inline"
                  >
                    <Mic className="w-4 h-4" />
                    Practice with Yoodli
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Post-Meeting Debrief & Materials */}
            <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Post-Meeting Debrief
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">Enriches AI Coaching</Badge>
                    </CardTitle>
                    <CardDescription>
                      Capture meeting outcomes, transcripts, and notes for continuous learning
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <PostMeetingQuestionAnswers 
                  projectId={projectId}
                  companyName={project?.companyName}
                />
                
                <div className="border-t pt-6">
                  <ArtifactUpload
                    projectId={projectId}
                    meetingContext="post_meeting"
                    title="Post-Meeting Materials"
                    description="Upload meeting transcripts, debriefs, or key takeaways after client interactions"
                    compact={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Unified Artifact Library - All meeting materials in one place */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="w-full" data-testid="trigger-artifact-library">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold">Meeting Artifact Library</h4>
                      <p className="text-xs text-muted-foreground">View all pre-meeting and post-meeting materials in one place</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <ArtifactLibrary 
                  projectId={projectId} 
                  companyName={project?.companyName}
                />
              </CollapsibleContent>
            </Collapsible>

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
          meetingInsights={{
            attendees: meetingAttendees.map(a => ({
              name: a.name,
              title: a.title,
              affiliation: a.affiliation || "client",
              role: a.role || "",
              influence: a.influence,
              aiResearch: a.aiResearch
            })),
            transcriptAnalysis: transcriptAnalysis,
            greenSheetContext: {
              objective: greenSheetEdits.objective || "",
              desiredOutcome: greenSheetEdits.desiredOutcome || "",
              openingStatement: greenSheetEdits.openingStatement || "",
              bestActionCommitment: greenSheetEdits.bestActionCommitment || ""
            }
          }}
        />}

        {/* Story Strength Widget - Uses same calculation as StoryCoach for consistency */}
        {discoveryStep === "insights" && (
          <StoryStrengthSummaryWidget 
            storyBuilderData={storyBuilderData}
            storyRefineResult={storyRefineResult}
          />
        )}
      </TabsContent>

          {/* GROWTH ACCELERATOR - Sales Play Builder */}
          <TabsContent value="growth_accelerator" className="space-y-6" data-testid="tab-content-growth-accelerator">
            <GrowthAcceleratorCanvas 
              projectId={projectId} 
              accountId={project?.accountId || undefined}
              companyName={project?.name || "Company"}
            />
          </TabsContent>

          {/* STAGE 3: STRATEGY SYNTHESIS - Miller Heiman Blue Sheet (Auto-Generated) */}
          <TabsContent value="strategy" className="space-y-6" data-testid="tab-content-strategy">
            {/* Synthesis Banner */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-purple-500/20" data-testid="synthesis-banner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Strategy Synthesis</p>
                <p className="text-xs text-muted-foreground">Auto-generated from your Discovery insights, Summary & Coaching, and Outcomes data</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Discovery
                </Badge>
                <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600 bg-blue-500/5">
                  <GraduationCap className="w-2.5 h-2.5 mr-1" />
                  Coaching
                </Badge>
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/5">
                  <Target className="w-2.5 h-2.5 mr-1" />
                  Outcomes
                </Badge>
              </div>
            </div>

            {/* Header Card */}
            <Card className="bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border-blue-500/20" data-testid="card-bluesheet">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Deal Strategy Canvas
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-blue-500/10 text-blue-600 text-xs cursor-help" data-testid="badge-miller-heiman">
                              Miller Heiman
                              <HelpCircle className="w-3 h-3 ml-1" />
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="text-xs">Based on the Miller Heiman Strategic Selling methodology - a proven framework for navigating complex B2B sales with multiple decision makers.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                      <CardDescription>
                        Your consolidated deal strategy synthesized from Discovery, Coaching, and Outcomes
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {blueSheet?.aiGenerated && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs" data-testid="badge-ai-generated">
                        AI Generated
                      </Badge>
                    )}
                    <Button 
                      size="sm"
                      className="gap-1"
                      onClick={() => generateBlueSheetMutation.mutate()}
                      disabled={generateBlueSheetMutation.isPending}
                      data-testid="button-generate-bluesheet"
                    >
                      {generateBlueSheetMutation.isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          {blueSheet ? "Regenerate" : "Generate Strategy"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {blueSheetLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Loading your deal strategy...</p>
                    </div>
                  </div>
                ) : blueSheet?.data ? (
                  <div className="space-y-6" data-testid="bluesheet-content">
                    
                    {/* DEAL HEALTH DASHBOARD */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-900/20 border" data-testid="section-deal-health">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm">Deal Health Dashboard</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">A quick overview of your deal's strategic health based on coverage of key decision makers, identified risks, and action readiness.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Strategy Score */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                              <circle 
                                cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" 
                                strokeDasharray={`${Math.min(100, (blueSheet.sectionCompletion?.overall || 0))} 100`}
                                className="text-blue-500 transition-all duration-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{blueSheet.sectionCompletion?.overall || 0}%</span>
                            </div>
                          </div>
                          <p className="text-xs font-medium">Strategy Score</p>
                        </div>
                        
                        {/* Decision Makers */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                              <circle 
                                cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" 
                                strokeDasharray={`${Math.min(100, (blueSheet.data.buyingInfluences?.length || 0) * 25)} 100`}
                                className="text-purple-500 transition-all duration-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{blueSheet.data.buyingInfluences?.length || 0}</span>
                            </div>
                          </div>
                          <p className="text-xs font-medium">Decision Makers</p>
                        </div>
                        
                        {/* Risk Score */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            {(() => {
                              const redFlags = blueSheet.data.summaryOfPositions?.filter((p: any) => p.type === "RedFlag")?.length || 0;
                              const riskLevel = redFlags === 0 ? "low" : redFlags <= 2 ? "medium" : "high";
                              const riskColor = riskLevel === "low" ? "text-emerald-500" : riskLevel === "medium" ? "text-amber-500" : "text-red-500";
                              const riskPercent = riskLevel === "low" ? 25 : riskLevel === "medium" ? 60 : 90;
                              return (
                                <>
                                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                                    <circle 
                                      cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" 
                                      strokeDasharray={`${riskPercent} 100`}
                                      className={`${riskColor} transition-all duration-500`}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold">{redFlags}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          <p className="text-xs font-medium">Risk Flags</p>
                        </div>
                        
                        {/* Actions Ready */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                              <circle 
                                cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" 
                                strokeDasharray={`${Math.min(100, (blueSheet.data.actionPlans?.length || 0) * 10)} 100`}
                                className="text-emerald-500 transition-all duration-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{blueSheet.data.actionPlans?.length || 0}</span>
                            </div>
                          </div>
                          <p className="text-xs font-medium">Action Items</p>
                        </div>
                      </div>
                    </div>

                    {/* DEAL GOAL & TIMELINE (was SSO) */}
                    {blueSheet.data.singleSalesObjective && (() => {
                      // Date validation: check for future dates (2026+)
                      const sso = blueSheet.data.singleSalesObjective || "";
                      const currentYear = new Date().getFullYear();
                      const datePatterns = [
                        /Q[1-4]\s*(\d{4})/gi,
                        /(?:by|in|before|during)\s+(\d{4})/gi,
                        /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,
                        /\b(20\d{2})\b/g
                      ];
                      let foundYear: number | null = null;
                      for (const pattern of datePatterns) {
                        const matches = [...sso.matchAll(pattern)];
                        for (const match of matches) {
                          const year = parseInt(match[1]);
                          if (year >= 2020 && year <= 2030) {
                            foundYear = year;
                            break;
                          }
                        }
                        if (foundYear) break;
                      }
                      const hasValidDate = foundYear !== null && foundYear >= currentYear;
                      const hasHistoricalDate = foundYear !== null && foundYear < currentYear;
                      
                      return (
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20" data-testid="section-sso">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-sm">Deal Goal & Timeline</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs">Your single, clear sales objective - what you're selling, to whom, when, and for how much. This keeps everyone aligned on the goal.</p>
                              </TooltipContent>
                            </Tooltip>
                            {hasValidDate && (
                              <Badge className="text-xs bg-emerald-500/10 text-emerald-600 gap-1" data-testid="badge-date-valid">
                                <Calendar className="w-3 h-3" />
                                {foundYear}
                              </Badge>
                            )}
                            {hasHistoricalDate && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className="text-xs bg-red-500/10 text-red-600 gap-1 cursor-help" data-testid="badge-date-invalid">
                                    <AlertTriangle className="w-3 h-3" />
                                    Historical Date
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                  <p className="text-xs">This timeline references {foundYear} which is in the past. Consider regenerating or updating with a current target date.</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {!foundYear && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className="text-xs bg-amber-500/10 text-amber-600 gap-1 cursor-help" data-testid="badge-date-missing">
                                    <Calendar className="w-3 h-3" />
                                    No Date
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                  <p className="text-xs">No target date detected. Add a specific timeline (e.g., Q2 2026) to keep the team aligned.</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {blueSheet.data.singleSalesObjectiveMarker && (
                              <Badge 
                                className={`text-xs ml-auto ${
                                  blueSheet.data.singleSalesObjectiveMarker === "Strength" 
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : blueSheet.data.singleSalesObjectiveMarker === "RedFlag"
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-amber-500/10 text-amber-600"
                                }`}
                                data-testid="badge-sso-marker"
                              >
                                {blueSheet.data.singleSalesObjectiveMarker === "RedFlag" ? "Needs Attention" : blueSheet.data.singleSalesObjectiveMarker}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed" data-testid="text-sso">{blueSheet.data.singleSalesObjective}</p>
                        </div>
                      );
                    })()}

                    {/* KEY DECISION MAKERS (was Buying Influences) */}
                    {(blueSheet.data.buyingInfluences?.length > 0 || blueSheet.data) && (
                      <div data-testid="section-buying-influences">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <Users className="w-4 h-4 text-purple-600" />
                          <h4 className="font-semibold text-sm">Key Decision Makers</h4>
                          <Badge variant="outline" className="text-xs">{blueSheet.data.buyingInfluences?.length || 0}</Badge>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs mb-2">People who influence the buying decision. Each plays a different role:</p>
                              <ul className="text-xs space-y-1">
                                <li><strong>Economic:</strong> Controls budget, final approval</li>
                                <li><strong>User:</strong> Will use your solution daily</li>
                                <li><strong>Technical:</strong> Evaluates feasibility (IT, Legal)</li>
                                <li><strong>Coach:</strong> Your internal champion</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                          <Dialog open={showAddInfluenceDialog} onOpenChange={setShowAddInfluenceDialog}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="ml-auto gap-1" data-testid="button-add-influence">
                                <Plus className="w-3 h-3" />
                                Add
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>{editingInfluenceIndex !== null ? "Edit Decision Maker" : "Add Decision Maker"}</DialogTitle>
                                <DialogDescription>
                                  {editingInfluenceIndex !== null 
                                    ? "Update the details of this stakeholder" 
                                    : "Add a new stakeholder to track in this deal"}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="influence-name">Name *</Label>
                                    <Input
                                      id="influence-name"
                                      placeholder="Jane Smith"
                                      value={newInfluence.name}
                                      onChange={(e) => setNewInfluence({ ...newInfluence, name: e.target.value })}
                                      data-testid="input-influence-name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="influence-title">Title</Label>
                                    <Input
                                      id="influence-title"
                                      placeholder="VP of Operations"
                                      value={newInfluence.title}
                                      onChange={(e) => setNewInfluence({ ...newInfluence, title: e.target.value })}
                                      data-testid="input-influence-title"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="influence-company">Company</Label>
                                  <Input
                                    id="influence-company"
                                    placeholder={project?.companyName || "Company name"}
                                    value={newInfluence.company}
                                    onChange={(e) => setNewInfluence({ ...newInfluence, company: e.target.value })}
                                    data-testid="input-influence-company"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="influence-role">Role Type</Label>
                                    <Select
                                      value={newInfluence.role}
                                      onValueChange={(v) => setNewInfluence({ ...newInfluence, role: v as any })}
                                    >
                                      <SelectTrigger data-testid="select-influence-role">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Economic">Economic</SelectItem>
                                        <SelectItem value="User">User</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="Coach">Coach</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="influence-level">Influence</Label>
                                    <Select
                                      value={newInfluence.degreeOfInfluence}
                                      onValueChange={(v) => setNewInfluence({ ...newInfluence, degreeOfInfluence: v as any })}
                                    >
                                      <SelectTrigger data-testid="select-influence-level">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="influence-mode">Mindset</Label>
                                    <Select
                                      value={newInfluence.mode}
                                      onValueChange={(v) => setNewInfluence({ ...newInfluence, mode: v as any })}
                                    >
                                      <SelectTrigger data-testid="select-influence-mode">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Growth">Growth</SelectItem>
                                        <SelectItem value="Trouble">Trouble</SelectItem>
                                        <SelectItem value="EvenKeel">Even Keel</SelectItem>
                                        <SelectItem value="Overconfident">Overconfident</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="influence-wins">What they want to achieve</Label>
                                  <Textarea
                                    id="influence-wins"
                                    placeholder="Recognition, career advancement, reduced workload..."
                                    value={newInfluence.personalWins}
                                    onChange={(e) => setNewInfluence({ ...newInfluence, personalWins: e.target.value })}
                                    className="min-h-[60px]"
                                    data-testid="input-influence-wins"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="influence-notes">Notes & Concerns</Label>
                                  <Textarea
                                    id="influence-notes"
                                    placeholder="Known concerns, objections, or additional context..."
                                    value={newInfluence.notes}
                                    onChange={(e) => setNewInfluence({ ...newInfluence, notes: e.target.value })}
                                    className="min-h-[60px]"
                                    data-testid="input-influence-notes"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                  setShowAddInfluenceDialog(false);
                                  setEditingInfluenceIndex(null);
                                  setNewInfluence({
                                    name: "",
                                    title: "",
                                    company: project?.companyName || "",
                                    role: "User",
                                    mode: "Growth",
                                    degreeOfInfluence: "Medium",
                                    personalWins: "",
                                    resultsWanted: "",
                                    notes: "",
                                    isManuallyAdded: true
                                  });
                                }}>Cancel</Button>
                                <Button 
                                  onClick={() => {
                                    if (editingInfluenceIndex !== null) {
                                      handleUpdateInfluence(editingInfluenceIndex, newInfluence);
                                      setEditingInfluenceIndex(null);
                                    } else {
                                      handleAddInfluence();
                                    }
                                  }} 
                                  disabled={!newInfluence.name.trim()} 
                                  data-testid="button-save-influence"
                                >
                                  {editingInfluenceIndex !== null ? "Save Changes" : "Add Decision Maker"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {blueSheet.data.buyingInfluences.map((influence: any, idx: number) => {
                            const roleColors: Record<string, string> = {
                              "Economic": "border-l-purple-500 bg-purple-500/5",
                              "EconomicBuyer": "border-l-purple-500 bg-purple-500/5",
                              "User": "border-l-blue-500 bg-blue-500/5",
                              "UserBuyer": "border-l-blue-500 bg-blue-500/5",
                              "Technical": "border-l-amber-500 bg-amber-500/5",
                              "TechnicalBuyer": "border-l-amber-500 bg-amber-500/5",
                              "Coach": "border-l-emerald-500 bg-emerald-500/5",
                            };
                            const roleBadgeColors: Record<string, string> = {
                              "Economic": "bg-purple-500/10 text-purple-600",
                              "EconomicBuyer": "bg-purple-500/10 text-purple-600",
                              "User": "bg-blue-500/10 text-blue-600",
                              "UserBuyer": "bg-blue-500/10 text-blue-600",
                              "Technical": "bg-amber-500/10 text-amber-600",
                              "TechnicalBuyer": "bg-amber-500/10 text-amber-600",
                              "Coach": "bg-emerald-500/10 text-emerald-600",
                            };
                            const modeDescriptions: Record<string, { label: string; color: string; tip: string }> = {
                              "growth": { label: "Growth", color: "text-emerald-600 bg-emerald-50", tip: "Actively seeking improvement - show them what's possible" },
                              "trouble": { label: "Trouble", color: "text-red-600 bg-red-50", tip: "Facing urgent problems - focus on solving their pain" },
                              "even_keel": { label: "Even Keel", color: "text-slate-600 bg-slate-100", tip: "Content with status quo - help them see hidden risks" },
                              "overconfident": { label: "Overconfident", color: "text-amber-600 bg-amber-50", tip: "Thinks they're ahead - respectfully challenge assumptions" },
                            };
                            const mode = influence.mode?.toLowerCase().replace(/\s+/g, '_') || "";
                            const modeInfo = modeDescriptions[mode];
                            const roleKey = influence.role || "";
                            const roleLabel = roleKey.replace(/Buyer$/i, '');
                            
                            const hasResearch = influence.stakeholderResearch && 
                              Object.values(influence.stakeholderResearch).some((v: any) => {
                                if (!v) return false;
                                if (Array.isArray(v)) return v.length > 0;
                                if (typeof v === 'string') return v.trim().length > 0;
                                return true;
                              });
                            const isExpanded = expandedResearch.has(idx);
                            
                            return (
                              <div 
                                key={idx} 
                                className={`p-4 rounded-lg border-l-4 ${roleColors[roleKey] || "border-l-slate-400 bg-slate-50/50"}`}
                                data-testid={`card-influence-${idx}`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm block truncate" data-testid={`text-influence-name-${idx}`}>
                                        {influence.name}
                                      </span>
                                      {influence.isManuallyAdded && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">Manual</Badge>
                                      )}
                                    </div>
                                    {influence.title && (
                                      <p className="text-xs text-muted-foreground truncate">{influence.title}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge 
                                          className={`text-xs cursor-help whitespace-nowrap ${roleBadgeColors[roleKey] || "bg-slate-200 text-slate-600"}`}
                                          data-testid={`badge-influence-role-${idx}`}
                                        >
                                          {roleLabel}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="max-w-xs">
                                        <p className="text-xs">
                                          {roleKey.includes("Economic") && "Controls budget and gives final approval. Your deal doesn't close without them."}
                                          {roleKey.includes("User") && "Will use your solution daily. Cares about usability and workflow impact."}
                                          {roleKey.includes("Technical") && "Evaluates feasibility - IT, security, legal. Can block deals with objections."}
                                          {roleKey === "Coach" && "Your internal champion. Provides intel and builds momentum for you."}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6 opacity-60 hover:opacity-100"
                                      onClick={() => {
                                        setNewInfluence({
                                          name: influence.name || "",
                                          title: influence.title || "",
                                          company: influence.company || project?.companyName || "",
                                          role: influence.role?.replace(/Buyer$/i, '') as any || "User",
                                          mode: influence.mode || "Growth",
                                          degreeOfInfluence: influence.degreeOfInfluence || "Medium",
                                          personalWins: influence.personalWins || "",
                                          resultsWanted: influence.resultsWanted || "",
                                          notes: influence.notes || "",
                                          isManuallyAdded: influence.isManuallyAdded || false
                                        });
                                        setEditingInfluenceIndex(idx);
                                        setShowAddInfluenceDialog(true);
                                      }}
                                      data-testid={`button-edit-influence-${idx}`}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6 opacity-60 hover:opacity-100"
                                      onClick={() => handleDeleteInfluence(idx)}
                                      data-testid={`button-delete-influence-${idx}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {modeInfo && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">Mindset:</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className={`text-xs cursor-help ${modeInfo.color}`}>
                                          {modeInfo.label}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="max-w-xs">
                                        <p className="text-xs">{modeInfo.tip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                )}
                                
                                {/* Win-Result if available */}
                                {influence.personalWins && (
                                  <div className="mt-3 p-2 rounded bg-white/50 dark:bg-slate-800/50 border border-dashed">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Trophy className="w-3 h-3 text-amber-500" />
                                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">What they want to achieve:</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{influence.personalWins}</p>
                                  </div>
                                )}

                                {/* Stakeholder Research Section */}
                                {hasResearch && (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => toggleResearchExpand(idx)}
                                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                                      data-testid={`button-expand-research-${idx}`}
                                    >
                                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      <Search className="w-3 h-3" />
                                      Stakeholder Research
                                    </button>
                                    {isExpanded && (
                                      <div className="mt-2 p-2 rounded bg-blue-50/50 dark:bg-blue-900/10 border text-xs space-y-2">
                                        {influence.stakeholderResearch.background && (
                                          <div>
                                            <span className="font-medium text-blue-700 dark:text-blue-400">Background:</span>
                                            <p className="text-muted-foreground">{influence.stakeholderResearch.background}</p>
                                          </div>
                                        )}
                                        {influence.stakeholderResearch.careerHistory && (
                                          <div>
                                            <span className="font-medium text-blue-700 dark:text-blue-400">Career History:</span>
                                            <p className="text-muted-foreground">{influence.stakeholderResearch.careerHistory}</p>
                                          </div>
                                        )}
                                        {influence.stakeholderResearch.priorities && (
                                          <div>
                                            <span className="font-medium text-blue-700 dark:text-blue-400">Priorities:</span>
                                            <p className="text-muted-foreground">{influence.stakeholderResearch.priorities}</p>
                                          </div>
                                        )}
                                        {influence.stakeholderResearch.communicationStyle && (
                                          <div>
                                            <span className="font-medium text-blue-700 dark:text-blue-400">Communication Style:</span>
                                            <p className="text-muted-foreground">{influence.stakeholderResearch.communicationStyle}</p>
                                          </div>
                                        )}
                                        {influence.stakeholderResearch.potentialMotivations && (
                                          <div>
                                            <span className="font-medium text-blue-700 dark:text-blue-400">Potential Motivations:</span>
                                            <p className="text-muted-foreground">{influence.stakeholderResearch.potentialMotivations}</p>
                                          </div>
                                        )}
                                        {influence.stakeholderResearch.riskFactors && (
                                          <div>
                                            <span className="font-medium text-blue-700 dark:text-blue-400">Risk Factors:</span>
                                            <p className="text-muted-foreground">{influence.stakeholderResearch.riskFactors}</p>
                                          </div>
                                        )}
                                        
                                        {/* Discovered Insights from Conversations */}
                                        {influence.stakeholderResearch.discoveredInsights?.length > 0 && (
                                          <div className="border-t pt-2 mt-2">
                                            <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                              <MessageSquare className="w-3 h-3" />
                                              Key Discovery Insights:
                                            </span>
                                            <ul className="text-muted-foreground list-disc ml-4 mt-1 space-y-0.5">
                                              {influence.stakeholderResearch.discoveredInsights.slice(0, 4).map((insight: string, i: number) => (
                                                <li key={i}>{insight}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {/* Source Attribution */}
                                        {influence.stakeholderResearch.sources?.length > 0 && (
                                          <div className="border-t pt-2 mt-2">
                                            <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                              <FileText className="w-3 h-3" />
                                              Data Sources:
                                            </span>
                                            <div className="mt-1 space-y-1">
                                              {influence.stakeholderResearch.sources.map((source: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                    {source.type}
                                                  </Badge>
                                                  <span>{source.detail}</span>
                                                  {source.date && (
                                                    <span className="text-slate-400">({source.date})</span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Conversation Sentiment */}
                                        {influence.stakeholderResearch.sentiment && (
                                          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                            <span className="font-medium text-purple-700 dark:text-purple-400">Sentiment:</span>
                                            <Badge 
                                              variant="outline" 
                                              className={
                                                influence.stakeholderResearch.sentiment.toLowerCase().includes('positive') 
                                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                                  : influence.stakeholderResearch.sentiment.toLowerCase().includes('negative')
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                              }
                                            >
                                              {influence.stakeholderResearch.sentiment}
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SMART RECOMMENDATIONS PANEL */}
                    {(() => {
                      const recommendations: Array<{ type: "warning" | "info" | "success"; icon: any; title: string; action: string }> = [];
                      const influences = blueSheet.data.buyingInfluences || [];
                      const redFlags = blueSheet.data.summaryOfPositions?.filter((p: any) => p.type === "RedFlag") || [];
                      
                      // Check for missing Economic Buyer
                      if (!influences.some((i: any) => i.role?.includes("Economic"))) {
                        recommendations.push({
                          type: "warning",
                          icon: AlertCircle,
                          title: "No Economic Buyer identified",
                          action: "Schedule a meeting with someone who controls budget decisions"
                        });
                      }
                      
                      // Check for missing Coach
                      if (!influences.some((i: any) => i.role === "Coach")) {
                        recommendations.push({
                          type: "warning",
                          icon: UserCheck,
                          title: "No internal champion found",
                          action: "Build a relationship with someone who can advocate for you internally"
                        });
                      }
                      
                      // Check if single-threaded
                      if (influences.length === 1) {
                        recommendations.push({
                          type: "warning",
                          icon: Users,
                          title: "Single-threaded deal risk",
                          action: "Expand to more contacts - deals with one contact are fragile"
                        });
                      }
                      
                      // Red flags need attention
                      if (redFlags.length > 2) {
                        recommendations.push({
                          type: "warning",
                          icon: AlertTriangle,
                          title: `${redFlags.length} risk areas need attention`,
                          action: "Review red flags below and prioritize addressing the most critical"
                        });
                      }
                      
                      // Good coverage
                      if (influences.length >= 3 && influences.some((i: any) => i.role?.includes("Economic")) && influences.some((i: any) => i.role === "Coach")) {
                        recommendations.push({
                          type: "success",
                          icon: CheckCircle2,
                          title: "Good stakeholder coverage",
                          action: "Focus on deepening relationships and addressing any objections"
                        });
                      }
                      
                      if (recommendations.length === 0) return null;
                      
                      return (
                        <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50" data-testid="section-recommendations">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span className="font-semibold text-sm">Smart Recommendations</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs">AI-generated suggestions based on gaps in your deal strategy. Address these to strengthen your position.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="space-y-2">
                            {recommendations.slice(0, 4).map((rec, idx) => (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-lg border flex items-start gap-3 ${
                                  rec.type === "warning" ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50" :
                                  rec.type === "success" ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50" :
                                  "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50"
                                }`}
                              >
                                <rec.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  rec.type === "warning" ? "text-amber-600" :
                                  rec.type === "success" ? "text-emerald-600" :
                                  "text-blue-600"
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{rec.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{rec.action}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* STRENGTHS & RISKS (was Red Flags) */}
                    {blueSheet.data.summaryOfPositions?.length > 0 && (
                      <div data-testid="section-positions">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="w-4 h-4 text-slate-600" />
                          <h4 className="font-semibold text-sm">Strengths & Risks</h4>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">
                                <strong>Strengths:</strong> Competitive advantages to leverage<br/>
                                <strong>Risks:</strong> Gaps in knowledge or influence that could stall your deal. Identifying risks is the first step to addressing them.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Strengths Column */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Your Strengths ({blueSheet.data.summaryOfPositions.filter((p: any) => p.type !== "RedFlag").length})
                            </p>
                            {blueSheet.data.summaryOfPositions
                              .filter((p: any) => p.type !== "RedFlag")
                              .slice(0, 4)
                              .map((position: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                                  data-testid={`card-strength-${idx}`}
                                >
                                  <p className="text-sm">{position.description}</p>
                                </div>
                              ))}
                            {blueSheet.data.summaryOfPositions.filter((p: any) => p.type !== "RedFlag").length === 0 && (
                              <p className="text-xs text-muted-foreground italic p-3 border border-dashed rounded-lg">No strengths identified yet</p>
                            )}
                          </div>
                          
                          {/* Risks Column */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Risks to Address ({blueSheet.data.summaryOfPositions.filter((p: any) => p.type === "RedFlag").length})
                            </p>
                            {blueSheet.data.summaryOfPositions
                              .filter((p: any) => p.type === "RedFlag")
                              .slice(0, 4)
                              .map((position: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                                  data-testid={`card-risk-${idx}`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm flex-1">{position.description}</p>
                                    {position.priority && (
                                      <Badge variant="outline" className="text-xs flex-shrink-0">
                                        P{position.priority}
                                      </Badge>
                                    )}
                                  </div>
                                  {position.actionRequired && (
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                      <ArrowRight className="w-3 h-3" />
                                      {position.actionRequired}
                                    </p>
                                  )}
                                </div>
                              ))}
                            {blueSheet.data.summaryOfPositions.filter((p: any) => p.type === "RedFlag").length === 0 && (
                              <p className="text-xs text-emerald-600 p-3 border border-emerald-200 bg-emerald-50/50 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                No major risks identified
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NEXT STEPS (was Action Plans) */}
                    {blueSheet.data.actionPlans?.length > 0 && (
                      <div data-testid="section-action-plans">
                        <div className="flex items-center gap-2 mb-4">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-sm">Recommended Next Steps</h4>
                          <Badge variant="outline" className="text-xs">{blueSheet.data.actionPlans.length}</Badge>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">Prioritized actions to move your deal forward. Focus on high-priority items first, especially those addressing risk flags.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="space-y-2">
                          {blueSheet.data.actionPlans.slice(0, 6).map((action: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-3 rounded-lg border bg-card hover-elevate flex items-start gap-3" 
                              data-testid={`card-action-${idx}`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                action.priority === "high" ? "bg-red-500/10 text-red-600" :
                                action.priority === "medium" ? "bg-amber-500/10 text-amber-600" :
                                "bg-blue-500/10 text-blue-600"
                              }`}>
                                <span className="text-xs font-bold">{idx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm" data-testid={`text-action-${idx}`}>{action.action}</p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  {action.owner && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {action.owner}
                                    </span>
                                  )}
                                  {action.target && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      {action.target}
                                    </span>
                                  )}
                                  {action.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {action.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {blueSheet.data.actionPlans.length > 6 && (
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs">
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                  Show {blueSheet.data.actionPlans.length - 6} more actions
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-2 mt-2">
                                {blueSheet.data.actionPlans.slice(6).map((action: any, idx: number) => (
                                  <div 
                                    key={idx + 6} 
                                    className="p-3 rounded-lg border bg-card flex items-start gap-3" 
                                    data-testid={`card-action-${idx + 6}`}
                                  >
                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-bold text-muted-foreground">{idx + 7}</span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm">{action.action}</p>
                                      {action.owner && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {action.owner}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                      <Target className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Ready to Build Your Deal Strategy</h3>
                    <p className="text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                      AI will analyze your discovery data to identify key decision makers, surface potential risks, and create a prioritized action plan to win this deal.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-6">
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/10">
                        <Users className="w-3 h-3 text-purple-500" />
                        Map Decision Makers
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Identify Risks
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        Plan Next Steps
                      </span>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => generateBlueSheetMutation.mutate()}
                      disabled={generateBlueSheetMutation.isPending}
                      data-testid="button-generate-bluesheet-empty"
                    >
                      {generateBlueSheetMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Discovery Data...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Deal Strategy
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                          } else if (data.shareLink?.shareToken) {
                            const fullUrl = `${window.location.origin}/portal/${data.shareLink.shareToken}`;
                            await navigator.clipboard.writeText(fullUrl);
                            toast({ 
                              title: "Link Copied!", 
                              description: "Client portal link has been copied to your clipboard." 
                            });
                          } else {
                            throw new Error("No share token returned");
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

            {/* Value Summary & Handoff Section at Bottom */}
            <Card className="bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-emerald-500/20 mt-6">
              <CardContent className="py-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold" data-testid="text-total-outcomes">{commitments.length}</p>
                      <p className="text-sm text-muted-foreground">Total Outcomes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600" data-testid="text-annual-value">
                        ${(commitments.reduce((sum: number, c: any) => sum + (c.estimatedAnnualValue || 0), 0) / 1000000).toFixed(2)}M
                      </p>
                      <p className="text-sm text-muted-foreground">Annual Value</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600" data-testid="text-confirmed-count">
                        {commitments.filter((c: any) => c.status === "client_confirmed").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => setShowHandoffConfirmDialog(true)}
                    disabled={commitments.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-submit-handoff"
                  >
                    <ArrowUpRight className="w-5 h-5 mr-2" />
                    Submit for Delivery Handoff
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Handoff Confirmation Dialog */}
            <Dialog open={showHandoffConfirmDialog} onOpenChange={setShowHandoffConfirmDialog}>
              <DialogContent className="max-w-lg" data-testid="dialog-handoff-confirmation">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Confirm Handoff to Delivery
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    You are about to finalize these outcomes and hand them off to the Delivery team. 
                    This will transition the engagement from Sales to Delivery phase.
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Outcomes:</span>
                      <span className="font-semibold">{commitments.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Annual Value:</span>
                      <span className="font-semibold text-emerald-600">
                        ${(commitments.reduce((sum: number, c: any) => sum + (c.estimatedAnnualValue || 0), 0) / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client Confirmed:</span>
                      <span className="font-semibold text-blue-600">
                        {commitments.filter((c: any) => c.status === "client_confirmed").length} outcomes
                      </span>
                    </div>
                  </div>

                  {commitments.filter((c: any) => c.status !== "client_confirmed").length > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700">
                        {commitments.filter((c: any) => c.status !== "client_confirmed").length} outcomes are not yet client-confirmed. 
                        Consider getting client approval before handoff.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowHandoffConfirmDialog(false)}
                    data-testid="button-cancel-handoff"
                  >
                    Go Back
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowHandoffConfirmDialog(false);
                      setActiveTab("handoff");
                      toast({
                        title: "Proceeding to Handoff",
                        description: "Review and complete the delivery handoff."
                      });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-confirm-handoff"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Handoff
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* STAGE 4: HANDOFF - Transition to Delivery */}
          <TabsContent value="handoff" className="space-y-6">
            <HandoffTab projectId={projectId} project={project} />
          </TabsContent>

          {/* STAGE 5: EVIDENCE PACK - Claims & Proof Points */}
          <TabsContent value="evidence" className="space-y-6" data-testid="tab-content-evidence">
            <EvidencePackInline projectId={projectId} projectName={project?.companyName || project?.name} />
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
    const [isConvertingOutcomes, setIsConvertingOutcomes] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      discovery: true,
      engagement: false,
      outcomes: true
    });
    const [handoffNotes, setHandoffNotes] = useState("");
    const [isConfirmHandoffOpen, setIsConfirmHandoffOpen] = useState(false);

    // Fetch commitments
    const { data: commitments = [] } = useQuery({
      queryKey: ["/api/projects", projectId, "commitments"],
    });

    // Fetch existing handoff packets
    const { data: handoffPackets = [] } = useQuery({
      queryKey: ["/api/projects", projectId, "handoffs"],
    });

    // Fetch strategy selection to check for pending outcomes
    const { data: strategySelection } = useQuery({
      queryKey: ["/api/projects", projectId, "strategy-selection"],
    });

    // Fetch discovery data (company data points)
    const { data: discoveryInsights = [] } = useQuery<any[]>({
      queryKey: ["/api/projects", projectId, "data-points"],
    });

    const { data: discoverySynthesis } = useQuery<any>({
      queryKey: ["/api/projects", projectId, "discovery-insights", "summary"],
    });

    const { data: jobThemes = [] } = useQuery<any[]>({
      queryKey: ["/api/projects", projectId, "job-themes"],
    });

    // Fetch Green Sheet data
    const { data: greenSheetData } = useQuery<any>({
      queryKey: ["/api/projects", projectId, "green-sheet"],
    });

    // Fetch artifacts
    const { data: artifacts = [] } = useQuery<any[]>({
      queryKey: ["/api/projects", projectId, "artifacts"],
    });

    // Fetch discovery notes for engagement context (returns single object, not array)
    const { data: discoveryNotesData } = useQuery<any>({
      queryKey: ["/api/projects", projectId, "discovery-notes"],
    });

    // Fetch strategic recommendations
    const { data: strategicRecommendations } = useQuery<any>({
      queryKey: ["/api/projects", projectId, "strategic-recommendations"],
    });

    // Fetch discovery questions and responses
    const { data: discoveryQuestions = [] } = useQuery<any[]>({
      queryKey: ["/api/projects", projectId, "discovery-questions"],
    });

    // Fetch Blue Sheet data (Miller Heiman Strategic Selling)
    const { data: bluesheetData } = useQuery<any>({
      queryKey: ["/api/projects", projectId, "bluesheet"],
      queryFn: async () => {
        const response = await fetch(`/api/projects/${projectId}/bluesheet`);
        if (!response.ok) return null;
        return response.json();
      },
    });

    // Fetch Evidence Pack data
    const { data: evidencePackData } = useQuery<any>({
      queryKey: [`/api/projects/${projectId}/evidence-pack`],
    });

    // Toggle section expansion
    const toggleSection = (section: string) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Confirm handoff mutation - creates handoff packet AND pushes to delivery
    const confirmHandoffMutation = useMutation({
      mutationFn: async () => {
        // Step 1: Create handoff packet with all confirmed commitments
        const commitmentIds = confirmedCommitments.map((c: any) => c.id);
        
        // Create handoff packet with provenance data
        const packetResponse = await apiRequest("POST", `/api/projects/${projectId}/handoffs`, {
          commitmentIds,
          salesOwnerName: "Sales Team",
          executiveSummary: handoffNotes || `Handoff package containing ${confirmedCommitments.length} confirmed outcomes worth $${(confirmedValue / 1000000).toFixed(2)}M in annual value.`,
        });
        const packet = await packetResponse.json();
        
        // Step 2: Confirm handoff to mark project as handed off
        const response = await apiRequest("POST", `/api/projects/${projectId}/confirm-handoff`, {
          handoffNotes,
          handoffPacketId: packet.id,
          confirmedAt: new Date().toISOString(),
        });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoffs"] });
        toast({
          title: "Handoff Confirmed",
          description: "Initiative successfully handed off to delivery team.",
        });
        setIsConfirmHandoffOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: "Handoff Failed",
          description: error?.message || "Unable to complete handoff. Please try again.",
          variant: "destructive",
        });
      },
    });

    // Create commitment mutation for converting outcomes
    const createCommitmentMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", `/api/projects/${projectId}/commitments`, data);
        return response.json();
      },
    });

    // Get pending outcomes that haven't been converted to commitments yet
    const pendingOutcomes = (strategySelection as any)?.generatedOutcomesData?.outcomes || [];
    const isStrategySelectionLoading = !strategySelection && strategySelection !== null;
    
    // Check if outcomes have already been converted by comparing with existing commitments
    // Commitments use 'name' field which is set from 'commitmentTitle' during creation
    const existingCommitmentNames = new Set((commitments as any[]).map(c => c.name));
    const unconvertedOutcomes = pendingOutcomes.filter((o: any) => 
      !existingCommitmentNames.has(o.outcomeName)
    );

    // Handle converting pending outcomes to commitments (Proceed to Handoff)
    const handleProceedToHandoff = async () => {
      if (unconvertedOutcomes.length === 0) return;
      
      setIsConvertingOutcomes(true);
      
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
      for (const outcome of unconvertedOutcomes) {
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
              kfOffering: outcome.kfOffering,
              kfRecommendation: outcome.kfRecommendation,
              whyMatters: outcome.whyMatters,
              howKFHelps: outcome.howKFHelps,
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
      
      setIsConvertingOutcomes(false);
      
      toast({
        title: "Outcomes Created",
        description: `${successCount} outcome${successCount !== 1 ? 's' : ''} have been converted to commitments.`
      });
    };

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

    // Compute readiness and provenance data
    const highPriorityInsights = discoveryInsights.filter((i: any) => i.priority === "high");
    const allOutcomes = (commitments as any[]);
    const outcomesWithProvenance = allOutcomes.filter((c: any) => c.provenance?.source || c.sourceAiSuggestion);
    const isHandoffConfirmed = project?.handoffConfirmedAt;
    
    // Compute engagement items count (discovery questions + artifacts + notes if present)
    const hasDiscoveryNotes = discoveryNotesData && (discoveryNotesData.freeformNotes || discoveryNotesData.topChallenges);
    const engagementItemsCount = discoveryQuestions.length + artifacts.length + (hasDiscoveryNotes ? 1 : 0);

    // Extract Blue Sheet strategic fields
    const bluesheetContent = bluesheetData?.data || {};
    const hasSingleSalesObjective = !!bluesheetContent.singleSalesObjective;
    const hasBuyingInfluences = (bluesheetContent.buyingInfluences || []).length > 0;
    const hasRedFlags = (bluesheetContent.redFlags || []).length > 0;
    const hasStrengths = (bluesheetContent.strengthsOfPosition || []).length > 0;

    // Extract Evidence Pack items by journey phase
    const evidenceItems = evidencePackData?.items || [];
    const leadingEvidence = evidenceItems.filter((e: any) => e.journeyPhase === "leading");
    const midLoopEvidence = evidenceItems.filter((e: any) => e.journeyPhase === "mid_loop");
    const laggingEvidence = evidenceItems.filter((e: any) => e.journeyPhase === "lagging");

    // Enhanced Readiness checks for handoff - Miller Heiman quality gates
    const readinessChecks = [
      { label: "Client confirmed outcomes", passed: confirmedCommitments.length > 0, icon: CheckCircle2, required: true },
      { label: "Discovery insights captured", passed: discoveryInsights.length > 0, icon: Lightbulb, required: true },
      { label: "Strategic themes identified", passed: jobThemes.length > 0, icon: Layers, required: false },
      { label: "Value targets established", passed: confirmedCommitments.some((c: any) => c.targetValue != null), icon: TrendingUp, required: true },
      { label: "Baseline values set", passed: confirmedCommitments.some((c: any) => c.baselineValue != null), icon: Target, required: true },
      { label: "Blue Sheet: Sales Objective", passed: hasSingleSalesObjective, icon: FileText, required: false },
      { label: "Blue Sheet: Buying Influences", passed: hasBuyingInfluences, icon: Users, required: false },
      { label: "Evidence captured", passed: evidenceItems.length > 0, icon: ClipboardCheck, required: false },
    ];
    const readinessScore = Math.round((readinessChecks.filter(c => c.passed).length / readinessChecks.length) * 100);
    const requiredChecksPassed = readinessChecks.filter(c => c.required).every(c => c.passed);
    const meetsMinimumThreshold = readinessScore >= 80 && requiredChecksPassed;
    const canConfirmHandoff = confirmedCommitments.length > 0 && meetsMinimumThreshold;

    return (
      <div className="space-y-6">
        {/* Header with Handoff Journey Flow */}
        <Card className="bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-purple-500/5 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Handoff Package
                    {isHandoffConfirmed && (
                      <Badge className="bg-emerald-600 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Confirmed
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Complete summary connecting discovery, engagement, and outcomes for delivery
                  </CardDescription>
                </div>
              </div>
              {!isHandoffConfirmed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        size="lg"
                        onClick={() => setIsConfirmHandoffOpen(true)}
                        disabled={!canConfirmHandoff}
                        className={canConfirmHandoff ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        data-testid="button-approve-handoff"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Approve & Send to Delivery
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canConfirmHandoff && (
                    <TooltipContent side="bottom">
                      <p className="text-sm">Complete required items and reach 80% readiness to enable handoff</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Journey Flow Visual */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-1">
                    <Search className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Discovery</p>
                      <p className="text-xs text-muted-foreground">{discoveryInsights.length} insights</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-1">
                    <MessageSquare className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Engagement</p>
                      <p className="text-xs text-muted-foreground">
                        {engagementItemsCount} items
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-1">
                    <Target className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Outcomes</p>
                      <p className="text-xs text-muted-foreground">{allOutcomes.length} defined</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-lg flex-1 ${
                    isHandoffConfirmed 
                      ? "bg-purple-500/10 border border-purple-500/20" 
                      : "bg-muted/50 border border-dashed"
                  }`}>
                    <Briefcase className={`w-5 h-5 shrink-0 ${isHandoffConfirmed ? "text-purple-600" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <p className={`font-medium text-sm ${!isHandoffConfirmed && "text-muted-foreground"}`}>Delivery</p>
                      <p className="text-xs text-muted-foreground">{isHandoffConfirmed ? "Active" : "Pending"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-6">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Discovery Insights</p>
                <p className="text-2xl font-bold text-blue-600">{discoveryInsights.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Strategic Themes</p>
                <p className="text-2xl font-bold text-indigo-600">{jobThemes.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Notes & Artifacts</p>
                <p className="text-2xl font-bold text-amber-600">{engagementItemsCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Outcomes</p>
                <p className="text-2xl font-bold text-emerald-600">{allOutcomes.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Client Confirmed</p>
                <p className="text-2xl font-bold text-purple-600">{confirmedCommitments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${(confirmedValue / 1000000).toFixed(1)}M
                  {confirmedCommitments.some((c: any) => c.valueCalculationBreakdown) && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">(click any KPI for details)</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Readiness Checklist with Visual Gauge */}
        <Card className={!meetsMinimumThreshold ? "border-amber-500/50" : "border-emerald-500/30"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                  readinessScore >= 80 ? 'bg-emerald-500/10' : readinessScore >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10'
                }`}>
                  <svg className="w-16 h-16 transform -rotate-90 absolute">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-muted/30"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${readinessScore * 1.76} 176`}
                      className={readinessScore >= 80 ? 'text-emerald-500' : readinessScore >= 60 ? 'text-amber-500' : 'text-red-500'}
                    />
                  </svg>
                  <span className={`text-lg font-bold ${
                    readinessScore >= 80 ? 'text-emerald-600' : readinessScore >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>{readinessScore}%</span>
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    Handoff Readiness Score
                  </CardTitle>
                  <CardDescription>
                    {meetsMinimumThreshold 
                      ? "Ready to send to Delivery" 
                      : "Complete required items before handoff"}
                  </CardDescription>
                </div>
              </div>
              {!meetsMinimumThreshold && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Minimum 80% + required items needed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              {readinessChecks.map((check, idx) => {
                const IconComponent = check.icon;
                return (
                  <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${
                    check.passed ? 'bg-emerald-500/10' : check.required ? 'bg-red-500/5 border border-red-500/20' : 'bg-muted/50'
                  }`}>
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : check.required ? (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={`text-xs ${check.passed ? '' : 'text-muted-foreground'}`}>
                      {check.label}
                      {check.required && !check.passed && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">* Required items must be completed before handoff</p>
          </CardContent>
        </Card>

        {/* Blue Sheet Summary - Miller Heiman Strategic Selling */}
        {bluesheetData && (
          <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20" data-testid="card-bluesheet-summary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Blue Sheet Summary
                  <Badge variant="outline" className="text-[10px]">Miller Heiman</Badge>
                </CardTitle>
                <div className="flex gap-1">
                  {hasSingleSalesObjective && <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">SSO</Badge>}
                  {hasBuyingInfluences && <Badge className="bg-indigo-500/10 text-indigo-600 text-[10px]">Influences</Badge>}
                  {hasRedFlags && <Badge className="bg-red-500/10 text-red-600 text-[10px]">Red Flags</Badge>}
                  {hasStrengths && <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Strengths</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Single Sales Objective */}
              {bluesheetContent.singleSalesObjective && (
                <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                  <p className="text-xs font-medium text-blue-600 uppercase mb-1">Single Sales Objective</p>
                  <p className="text-sm font-medium">{bluesheetContent.singleSalesObjective}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Buying Influences */}
                {(bluesheetContent.buyingInfluences || []).length > 0 && (
                  <div className="p-3 rounded-lg border bg-indigo-500/5 border-indigo-500/20">
                    <p className="text-xs font-medium text-indigo-600 uppercase mb-2">Key Buying Influences</p>
                    <div className="space-y-2">
                      {bluesheetContent.buyingInfluences.slice(0, 4).map((influence: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span className="text-sm">{influence.name || influence.role}</span>
                          {influence.type && (
                            <Badge variant="outline" className="text-[10px]">{influence.type}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags & Strengths */}
                <div className="space-y-3">
                  {(bluesheetContent.redFlags || []).length > 0 && (
                    <div className="p-3 rounded-lg border bg-red-500/5 border-red-500/20">
                      <p className="text-xs font-medium text-red-600 uppercase mb-2">Red Flags</p>
                      <div className="space-y-1">
                        {bluesheetContent.redFlags.slice(0, 3).map((flag: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-xs">{typeof flag === 'string' ? flag : flag.description || flag.flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(bluesheetContent.strengthsOfPosition || []).length > 0 && (
                    <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                      <p className="text-xs font-medium text-emerald-600 uppercase mb-2">Strengths of Position</p>
                      <div className="space-y-1">
                        {bluesheetContent.strengthsOfPosition.slice(0, 3).map((strength: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-xs">{typeof strength === 'string' ? strength : strength.description || strength.strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence Pack Summary by Journey Phase */}
        {evidenceItems.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20" data-testid="card-evidence-summary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Evidence Pack Summary
                  <Badge variant="outline">{evidenceItems.length} items</Badge>
                </CardTitle>
              </div>
              <CardDescription>Claims and proof points organized by customer journey phase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Leading Phase */}
                <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-blue-700">Leading</p>
                      <p className="text-[10px] text-muted-foreground">Discovery signals</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{leadingEvidence.length}</p>
                  {leadingEvidence.length > 0 ? (
                    <div className="space-y-1">
                      {leadingEvidence.slice(0, 2).map((e: any, idx: number) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate">
                          {e.title || e.evidenceType}
                        </p>
                      ))}
                      {leadingEvidence.length > 2 && (
                        <p className="text-[10px] text-blue-600">+{leadingEvidence.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No leading evidence yet</p>
                  )}
                </div>

                {/* Mid-Loop Phase */}
                <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-amber-700">Mid-Loop</p>
                      <p className="text-[10px] text-muted-foreground">Behavior under pressure</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-amber-600 mb-2">{midLoopEvidence.length}</p>
                  {midLoopEvidence.length > 0 ? (
                    <div className="space-y-1">
                      {midLoopEvidence.slice(0, 2).map((e: any, idx: number) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate">
                          {e.title || e.evidenceType}
                        </p>
                      ))}
                      {midLoopEvidence.length > 2 && (
                        <p className="text-[10px] text-amber-600">+{midLoopEvidence.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No mid-loop evidence yet</p>
                  )}
                </div>

                {/* Lagging Phase */}
                <div className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-emerald-700">Lagging</p>
                      <p className="text-[10px] text-muted-foreground">Results with context</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 mb-2">{laggingEvidence.length}</p>
                  {laggingEvidence.length > 0 ? (
                    <div className="space-y-1">
                      {laggingEvidence.slice(0, 2).map((e: any, idx: number) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate">
                          {e.title || e.evidenceType}
                        </p>
                      ))}
                      {laggingEvidence.length > 2 && (
                        <p className="text-[10px] text-emerald-600">+{laggingEvidence.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No lagging evidence yet</p>
                  )}
                </div>
              </div>

              {/* Journey Flow Connector */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Discovered</span>
                <ChevronRight className="w-4 h-4" />
                <span>Adapted</span>
                <ChevronRight className="w-4 h-4" />
                <span>Achieved</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SECTION 1: Discovery Summary */}
        <Card data-testid="card-discovery-summary">
          <CardHeader 
            className="cursor-pointer hover-elevate" 
            onClick={() => toggleSection('discovery')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">1. Discovery Summary</CardTitle>
                  <CardDescription>Key findings, themes, and strategic insights</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{discoveryInsights.length} insights</Badge>
                {expandedSections.discovery ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedSections.discovery && (
            <CardContent className="space-y-4">
              {/* Executive Summary from Synthesis */}
              {discoverySynthesis?.summary && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">Executive Summary</span>
                  </div>
                  <p className="text-sm leading-relaxed">{discoverySynthesis.summary}</p>
                </div>
              )}

              {/* What We Learned - Key Themes from Synthesis */}
              {discoverySynthesis?.whatWeLearned?.keyThemes?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">What We Learned</span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {discoverySynthesis.whatWeLearned.keyThemes.slice(0, 4).map((theme: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <p className="font-medium text-sm text-blue-700">{theme.theme}</p>
                        <p className="text-xs text-muted-foreground mt-1">{theme.insight}</p>
                        {theme.supportingEvidence?.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1 italic">
                            Evidence: {theme.supportingEvidence.slice(0, 2).join("; ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Themes / Job Themes */}
              {jobThemes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold">Strategic Themes</span>
                    <Badge variant="outline" className="text-xs">{jobThemes.length} identified</Badge>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {jobThemes.slice(0, 4).map((theme: any) => (
                      <div key={theme.id} className="p-3 rounded-lg border bg-indigo-500/5 border-indigo-500/20">
                        <p className="font-medium text-sm">{theme.jobTheme || theme.name}</p>
                        {theme.strategicPriority && (
                          <p className="text-xs text-muted-foreground mt-1">{theme.strategicPriority}</p>
                        )}
                        {theme.capability && (
                          <Badge variant="outline" className="text-[10px] mt-1">{theme.capability}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Implications from Synthesis */}
              {discoverySynthesis?.businessImplications && (
                <div className="grid gap-3 md:grid-cols-2">
                  {discoverySynthesis.businessImplications.opportunities?.length > 0 && (
                    <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">Opportunities</span>
                      </div>
                      <div className="space-y-1">
                        {discoverySynthesis.businessImplications.opportunities.slice(0, 3).map((opp: any, idx: number) => (
                          <p key={idx} className="text-xs">• {opp.title || opp}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {discoverySynthesis.businessImplications.risks?.length > 0 && (
                    <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">Risks to Address</span>
                      </div>
                      <div className="space-y-1">
                        {discoverySynthesis.businessImplications.risks.slice(0, 3).map((risk: any, idx: number) => (
                          <p key={idx} className="text-xs">• {risk.title || risk}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* High-Priority Insights */}
              {highPriorityInsights.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold">Key Insights for Delivery</span>
                    <Badge variant="outline" className="text-xs">{highPriorityInsights.length} high priority</Badge>
                  </div>
                  <div className="space-y-2">
                    {highPriorityInsights.slice(0, 5).map((insight: any) => (
                      <div key={insight.id} className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                        <p className="text-sm">{insight.content}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {insight.kornferryPillar && (
                            <Badge variant="outline" className="text-[10px]">{insight.kornferryPillar}</Badge>
                          )}
                          {insight.solutionArea && (
                            <Badge variant="outline" className="text-[10px]">{insight.solutionArea}</Badge>
                          )}
                          {insight.classification && (
                            <Badge variant="outline" className="text-[10px] bg-purple-500/10">{insight.classification}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Recommendations Summary */}
              {strategicRecommendations?.strategies?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold">AI Strategic Recommendations</span>
                  </div>
                  <div className="space-y-2">
                    {strategicRecommendations.strategies.slice(0, 3).map((strategy: any) => (
                      <div key={strategy.id} className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{strategy.strategyName}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{strategy.strategyDescription}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Badge variant="outline" className="text-[10px]">{strategy.strategicCategory}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${
                              strategy.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                              strategy.priority === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-500/10'
                            }`}>{strategy.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {discoveryInsights.length === 0 && jobThemes.length === 0 && !discoverySynthesis && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No discovery data captured yet</p>
                  <p className="text-xs mt-1">Complete discovery to populate this section</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* SECTION 2: Engagement Summary */}
        <Card data-testid="card-engagement-summary">
          <CardHeader 
            className="cursor-pointer hover-elevate" 
            onClick={() => toggleSection('engagement')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">2. Engagement Context</CardTitle>
                  <CardDescription>Green Sheet, meetings, and artifacts</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasDiscoveryNotes && (
                  <Badge variant="outline">Notes</Badge>
                )}
                {artifacts.length > 0 && (
                  <Badge variant="outline">{artifacts.length} artifacts</Badge>
                )}
                {discoveryQuestions.length > 0 && (
                  <Badge variant="outline">{discoveryQuestions.length} questions</Badge>
                )}
                {greenSheetData && (
                  <Badge variant="outline" className="bg-emerald-500/10">Green Sheet</Badge>
                )}
                {expandedSections.engagement ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedSections.engagement && (
            <CardContent className="space-y-4">
              {/* Green Sheet Summary */}
              {greenSheetData && (greenSheetData.callObjective || greenSheetData.desiredOutcome || greenSheetData.openingStatement) && (
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold">Green Sheet Summary</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {greenSheetData.callObjective && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Call Objective</p>
                        <p className="text-sm">{greenSheetData.callObjective}</p>
                      </div>
                    )}
                    {greenSheetData.desiredOutcome && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Desired Outcome</p>
                        <p className="text-sm">{greenSheetData.desiredOutcome}</p>
                      </div>
                    )}
                    {greenSheetData.openingStatement && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Opening Statement</p>
                        <p className="text-sm">{greenSheetData.openingStatement}</p>
                      </div>
                    )}
                    {greenSheetData.primaryContact && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Primary Contact</p>
                        <p className="text-sm">{greenSheetData.primaryContact}</p>
                      </div>
                    )}
                    {greenSheetData.meetingDate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Meeting Date</p>
                        <p className="text-sm">{new Date(greenSheetData.meetingDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Discovery Notes */}
              {hasDiscoveryNotes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">Discovery Notes</span>
                  </div>
                  <div className="space-y-2">
                    {discoveryNotesData?.topChallenges && (
                      <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Top Challenges</p>
                        <p className="text-sm">{discoveryNotesData.topChallenges}</p>
                      </div>
                    )}
                    {discoveryNotesData?.freeformNotes && (
                      <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Notes</p>
                        <p className="text-sm line-clamp-4">{discoveryNotesData.freeformNotes}</p>
                      </div>
                    )}
                    {discoveryNotesData?.keyStakeholder && (
                      <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Key Stakeholder</p>
                        <p className="text-sm">{discoveryNotesData.keyStakeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Discovery Questions & Responses */}
              {discoveryQuestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold">Discovery Questions</span>
                    <Badge variant="outline" className="text-xs">{discoveryQuestions.length} questions</Badge>
                  </div>
                  <div className="space-y-2">
                    {discoveryQuestions.slice(0, 3).map((q: any) => (
                      <div key={q.id} className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/20">
                        <p className="text-sm font-medium">{q.question}</p>
                        {q.responses?.length > 0 && (
                          <div className="mt-2 pl-3 border-l-2 border-purple-300">
                            <p className="text-xs text-muted-foreground">{q.responses[0].response}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {q.methodology && (
                            <Badge variant="outline" className="text-[10px]">{q.methodology}</Badge>
                          )}
                          {q.category && (
                            <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Artifacts */}
              {artifacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-semibold">Collected Artifacts</span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {artifacts.slice(0, 6).map((artifact: any) => (
                      <div key={artifact.id} className="p-3 rounded-lg border bg-violet-500/5 border-violet-500/20">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{artifact.fileName || artifact.name}</p>
                            <p className="text-xs text-muted-foreground">{artifact.artifactType || 'Document'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {artifacts.length > 6 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      + {artifacts.length - 6} more artifacts
                    </p>
                  )}
                </div>
              )}

              {!greenSheetData && artifacts.length === 0 && !hasDiscoveryNotes && discoveryQuestions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No engagement context captured yet</p>
                  <p className="text-xs mt-1">Complete Green Sheet or add notes to populate this section</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* SECTION 3: Outcomes with Provenance */}
        <Card data-testid="card-outcomes-provenance">
          <CardHeader 
            className="cursor-pointer hover-elevate" 
            onClick={() => toggleSection('outcomes')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">3. Outcomes for Delivery</CardTitle>
                  <CardDescription>Confirmed outcomes with discovery provenance</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600">{confirmedCommitments.length} confirmed</Badge>
                <Badge variant="outline">${(confirmedValue / 1000000).toFixed(1)}M</Badge>
                {expandedSections.outcomes ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedSections.outcomes && (
            <CardContent className="space-y-4">
              {allOutcomes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No outcomes defined yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("value-agreement")}>
                    Go to Outcome Design
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {allOutcomes.map((c: any) => {
                    const journeyTemplate = c.solutionPattern ? OUTCOME_JOURNEY_TEMPLATES[c.solutionPattern as SolutionPatternId] : null;
                    const hasProvenance = c.provenance?.source || c.sourceAiSuggestion;
                    
                    return (
                      <div 
                        key={c.id}
                        className={`p-4 rounded-lg border ${
                          c.status === 'client_confirmed' 
                            ? 'border-emerald-500/30 bg-emerald-500/5' 
                            : 'border-muted'
                        }`}
                        data-testid={`outcome-handoff-${c.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{c.name}</h4>
                              {c.status === 'client_confirmed' && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">Confirmed</Badge>
                              )}
                              {c.status === 'draft' && (
                                <Badge variant="outline" className="text-xs">Draft</Badge>
                              )}
                              {hasProvenance && (
                                <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/30">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Generated
                                </Badge>
                              )}
                            </div>

                            {c.outcomeStatement && (
                              <p className="text-sm text-muted-foreground mt-1">{c.outcomeStatement}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-2">
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
                              {c.baselineValue !== null && c.targetValue !== null && (
                                <span className="text-sm text-muted-foreground">
                                  {c.baselineValue} → {c.targetValue} {c.kpiUnit || ""}
                                </span>
                              )}
                              {journeyTemplate?.typicalTimeline && (
                                <Badge variant="outline" className="text-[10px]">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {journeyTemplate.typicalTimeline}
                                </Badge>
                              )}
                            </div>

                            {/* Provenance - Connection to Discovery */}
                            {hasProvenance && (
                              <div className="mt-3 p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                                <div className="flex items-center gap-2 text-xs">
                                  <Link2 className="w-3 h-3 text-purple-600" />
                                  <span className="text-purple-700 font-medium">Discovery Connection:</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {c.provenance?.kornFerrySolution && `Strategy: ${c.provenance.kornFerrySolution}`}
                                  {c.sourceAiSuggestion?.sourceInsightTitle && ` • Insight: "${c.sourceAiSuggestion.sourceInsightTitle}"`}
                                </p>
                              </div>
                            )}

                            {/* Delivery Roadmap Preview */}
                            {journeyTemplate && (
                              <div className="mt-3 pt-2 border-t border-dashed">
                                <div className="flex items-center gap-1">
                                  {journeyTemplate.phases.slice(0, 4).map((phase, idx) => (
                                    <div key={idx} className="flex items-center">
                                      <div className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                        {phase.phase}
                                      </div>
                                      {idx < Math.min(journeyTemplate.phases.length, 4) - 1 && (
                                        <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0">
                            {c.estimatedAnnualValue && (
                              <div className="text-lg font-bold text-emerald-600">
                                <ValueWithProvenance
                                  value={c.estimatedAnnualValue}
                                  unit="$"
                                  commitment={c}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Handoff History */}
        {(handoffPackets as any[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirm Handoff Dialog */}
        <Dialog open={isConfirmHandoffOpen} onOpenChange={setIsConfirmHandoffOpen}>
          <DialogContent className="max-w-lg" data-testid="dialog-confirm-handoff">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                Confirm Handoff to Delivery
              </DialogTitle>
              <DialogDescription>
                This will finalize the handoff package and notify the delivery team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discovery Insights:</span>
                  <span className="font-semibold">{discoveryInsights.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strategic Themes:</span>
                  <span className="font-semibold">{jobThemes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Outcomes:</span>
                  <span className="font-semibold">{allOutcomes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Client Confirmed:</span>
                  <span className="font-semibold text-emerald-600">{confirmedCommitments.length}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Total Annual Value:</span>
                  <span className="font-bold text-emerald-600">${(confirmedValue / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handoff-notes">Handoff Notes (optional)</Label>
                <Textarea
                  id="handoff-notes"
                  placeholder="Add any context or special instructions for the delivery team..."
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="input-handoff-notes"
                />
              </div>

              {readinessScore < 80 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Readiness is at {readinessScore}%. Consider completing more items before handoff for best results.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmHandoffOpen(false)}
                data-testid="button-cancel-handoff-confirm"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => confirmHandoffMutation.mutate()}
                disabled={confirmHandoffMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-final-handoff"
              >
                {confirmHandoffMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Confirm & Send to Delivery
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Success Plan Tab Component
  const SuccessPlanTab = ({ 
    projectId, 
    project 
  }: { 
    projectId: number; 
    project: Project; 
  }) => {
    const [editingOutcome, setEditingOutcome] = useState<string | null>(null);
    const [outcomeStatus, setOutcomeStatus] = useState<Record<string, string>>({});
    
    // Fetch success plans
    const { data: successPlans = [], isLoading: plansLoading, error: plansError } = useQuery<Array<{
      id: number;
      projectId: number;
      title: string;
      status: string;
      desiredOutcomes: Array<{
        id: string;
        outcome: string;
        businessImpact: string;
        successMetric: string;
        targetDate: string;
        status: "not_started" | "in_progress" | "achieved" | "at_risk";
        linkedKPIIds?: number[];
      }>;
      customerResponsibilities: string[];
      vendorResponsibilities: string[];
      executiveSponsor: string | null;
      deliveryLead: string | null;
      kickoffDate: string | null;
      targetCompletionDate: string | null;
      reviewCadence: string;
      nextReviewDate: string | null;
      overallProgress: number;
      riskLevel: string;
      riskNotes: string | null;
    }>>({
      queryKey: ["/api/projects", projectId, "success-plans"],
    });

    // Mutation to update success plan
    const updatePlanMutation = useMutation({
      mutationFn: async (data: { id: number; updates: any }) => {
        const res = await apiRequest("PATCH", `/api/success-plans/${data.id}`, data.updates);
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "success-plans"] });
        setEditingOutcome(null);
        toast({ title: "Outcome Updated", description: "Status has been updated successfully." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to update outcome status." });
      },
    });

    const updateOutcomeStatus = (planId: number, outcomeId: string, newStatus: string) => {
      const plan = successPlans.find(p => p.id === planId);
      if (!plan) return;
      
      const updatedOutcomes = plan.desiredOutcomes.map(o => 
        o.id === outcomeId ? { ...o, status: newStatus as any } : o
      );
      
      updatePlanMutation.mutate({
        id: planId,
        updates: { desiredOutcomes: updatedOutcomes }
      });
    };

    const currentPlan = successPlans[0];

    return (
      <div className="space-y-6">
        {/* Success Plan Header */}
        <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Joint Success Plan</CardTitle>
                  <CardDescription>Collaborative success planning with customer stakeholders</CardDescription>
                </div>
              </div>
              {currentPlan && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={currentPlan.overallProgress} className="w-24 h-2" />
                    <span className="text-lg font-bold">{currentPlan.overallProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {plansLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : currentPlan ? (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={currentPlan.status === "active" ? "default" : "secondary"}
                    className="mt-1"
                    data-testid="badge-plan-status"
                  >
                    {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">Review Cadence</p>
                  <p className="font-medium capitalize">{currentPlan.reviewCadence}</p>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge 
                    variant={currentPlan.riskLevel === "low" ? "default" : currentPlan.riskLevel === "medium" ? "secondary" : "destructive"}
                    data-testid="badge-risk-level"
                  >
                    {currentPlan.riskLevel.charAt(0).toUpperCase() + currentPlan.riskLevel.slice(1)}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">Desired Outcomes</p>
                  <p className="text-2xl font-bold text-amber-600">{currentPlan.desiredOutcomes?.length || 0}</p>
                </div>
              </div>
            ) : plansError ? (
              <div className="text-center py-6 text-destructive">
                <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                <p className="text-sm">Failed to load success plans</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No success plan created yet</p>
                <p className="text-xs text-muted-foreground">
                  Success plans will be auto-generated when handoff is confirmed
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {currentPlan && (
          <>
            {/* Responsibilities */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Customer Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentPlan.customerResponsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50" data-testid={`customer-responsibility-${idx}`}>
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{resp}</span>
                      </div>
                    ))}
                    {currentPlan.customerResponsibilities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No responsibilities defined</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    Korn Ferry Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentPlan.vendorResponsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50" data-testid={`vendor-responsibility-${idx}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span className="text-sm">{resp}</span>
                      </div>
                    ))}
                    {currentPlan.vendorResponsibilities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No responsibilities defined</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desired Outcomes Management */}
            {currentPlan.desiredOutcomes && currentPlan.desiredOutcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    Desired Outcomes
                  </CardTitle>
                  <CardDescription>Track and manage customer success outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentPlan.desiredOutcomes.map((outcome) => (
                      <div 
                        key={outcome.id} 
                        className="p-4 rounded-lg border bg-background"
                        data-testid={`outcome-${outcome.id}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{outcome.outcome}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{outcome.businessImpact}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={outcome.status} 
                              onValueChange={(val) => updateOutcomeStatus(currentPlan.id, outcome.id, val)}
                              disabled={updatePlanMutation.isPending}
                            >
                              <SelectTrigger className="w-36" data-testid={`select-outcome-status-${outcome.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="achieved">Achieved</SelectItem>
                                <SelectItem value="at_risk">At Risk</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Success Metric</p>
                            <p className="font-medium">{outcome.successMetric}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Target Date</p>
                            <p className="font-medium">
                              {outcome.targetDate ? new Date(outcome.targetDate).toLocaleDateString() : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge 
                              variant={
                                outcome.status === "achieved" ? "default" :
                                outcome.status === "in_progress" ? "secondary" :
                                outcome.status === "at_risk" ? "destructive" : "outline"
                              }
                            >
                              {outcome.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Stakeholders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Key Stakeholders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Executive Sponsor</p>
                    <p className="font-medium">{currentPlan.executiveSponsor || "Not assigned"}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Delivery Lead</p>
                    <p className="font-medium">{currentPlan.deliveryLead || "Not assigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Kickoff Date</p>
                    <p className="font-medium">
                      {currentPlan.kickoffDate ? new Date(currentPlan.kickoffDate).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Target Completion</p>
                    <p className="font-medium">
                      {currentPlan.targetCompletionDate ? new Date(currentPlan.targetCompletionDate).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Next Review</p>
                    <p className="font-medium">
                      {currentPlan.nextReviewDate ? new Date(currentPlan.nextReviewDate).toLocaleDateString() : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
    const [initializeSuccessPlan, setInitializeSuccessPlan] = useState(true);
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [isClarifyDialogOpen, setIsClarifyDialogOpen] = useState(false);
    const [showAIPackageDetails, setShowAIPackageDetails] = useState(false);

    // Fetch handoff packets
    const { data: handoffPackets = [], isLoading: packetsLoading, error: packetsError } = useQuery({
      queryKey: ["/api/projects", projectId, "handoffs"],
      enabled: !!projectId,
    });

    // Fetch AI handoff package
    const { data: aiHandoffPackage, isLoading: aiPackageLoading, error: aiPackageError, refetch: refetchAIPackage } = useQuery<{
      handoffBrief: string;
      keyCommitments: Array<{ name: string; target: string; timeline: string }>;
      criticalSuccessFactors: string[];
      recommendedActions: string[];
      riskAreas: string[];
    }>({
      queryKey: ["/api/projects", projectId, "handoff-package"],
      enabled: !!projectId,
    });

    // Fetch delivery readiness
    const { data: deliveryReadiness, isLoading: readinessLoading, error: readinessError } = useQuery<{
      score: number;
      checks: Array<{ label: string; passed: boolean; weight: number }>;
    }>({
      queryKey: ["/api/projects", projectId, "delivery-readiness"],
      enabled: !!projectId,
    });

    // Generate AI handoff package mutation
    const generateAIPackageMutation = useMutation({
      mutationFn: async () => {
        const response = await apiRequest("POST", `/api/projects/${projectId}/handoff-package/generate`);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoff-package"] });
        toast({ title: "AI Package Generated", description: "The handoff brief has been created." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to generate AI package." });
      }
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
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoffs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "success-plans"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
        setIsAcceptDialogOpen(false);
        setSelectedHandoff(null);
        setAcceptanceNotes("");
        const message = data?.successPlan 
          ? "Handoff accepted and success plan initialized."
          : "Outcomes are now ready for delivery tracking.";
        toast({ title: "Handoff accepted", description: message });
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

        {/* AI Handoff Package & Delivery Readiness */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Delivery Readiness Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Delivery Readiness
                </CardTitle>
                <CardDescription>Pre-handoff checklist completion</CardDescription>
              </div>
              {deliveryReadiness && (
                <Badge 
                  variant={deliveryReadiness.score >= 80 ? "default" : "secondary"}
                  data-testid="badge-readiness-status"
                >
                  {deliveryReadiness.score >= 80 ? "Ready" : "In Progress"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {readinessLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : deliveryReadiness ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold" data-testid="text-readiness-score">
                      {deliveryReadiness.score}%
                    </div>
                    <Progress value={deliveryReadiness.score} className="flex-1 h-3" />
                  </div>
                  <div className="grid gap-2">
                    {deliveryReadiness.checks.map((check, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                        data-testid={`readiness-check-${idx}`}
                      >
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm flex-1">{check.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {check.weight}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to calculate readiness</p>
              )}
            </CardContent>
          </Card>

          {/* AI Handoff Package */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Handoff Brief
                </CardTitle>
                <CardDescription>AI-generated engagement summary</CardDescription>
              </div>
              <Button
                size="sm"
                variant={aiHandoffPackage ? "outline" : "default"}
                onClick={() => generateAIPackageMutation.mutate()}
                disabled={generateAIPackageMutation.isPending}
                data-testid="button-generate-ai-package"
              >
                {generateAIPackageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {aiHandoffPackage ? "Regenerate" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {aiPackageLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : aiHandoffPackage ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <p className="text-sm whitespace-pre-wrap">{aiHandoffPackage.handoffBrief}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAIPackageDetails(!showAIPackageDetails)}
                    className="w-full"
                    data-testid="button-toggle-ai-details"
                  >
                    {showAIPackageDetails ? (
                      <ChevronUp className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    {showAIPackageDetails ? "Hide Details" : "Show Details"}
                  </Button>
                  {showAIPackageDetails && (
                    <div className="space-y-4">
                      {aiHandoffPackage.keyCommitments?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Commitments</h4>
                          <div className="space-y-2">
                            {aiHandoffPackage.keyCommitments.map((c, i) => (
                              <div key={i} className="p-2 rounded bg-muted/50 text-sm">
                                <span className="font-medium">{c.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  Target: {c.target} by {c.timeline}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiHandoffPackage.criticalSuccessFactors?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Critical Success Factors</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {aiHandoffPackage.criticalSuccessFactors.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiHandoffPackage.riskAreas?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Risk Areas
                          </h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {aiHandoffPackage.riskAreas.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate an AI-powered handoff brief to summarize this engagement
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                              <ValueWithProvenance
                                value={c.estimatedAnnualValue}
                                unit="$"
                                commitment={c}
                              />
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="initialize-success-plan"
                  checked={initializeSuccessPlan}
                  onCheckedChange={(checked) => setInitializeSuccessPlan(checked === true)}
                  data-testid="checkbox-initialize-success-plan"
                />
                <Label htmlFor="initialize-success-plan" className="text-sm font-medium cursor-pointer">
                  Initialize Success Plan from handoff outcomes
                </Label>
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
                        initializeSuccessPlan,
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

  // Lifecycle stage configuration with icons and descriptions
  const lifecycleStages = [
    { 
      id: "onboarding", 
      label: "Onboarding", 
      icon: Handshake,
      description: "Handoff acceptance & kickoff",
      gradient: "from-blue-500/5 to-cyan-500/5",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600"
    },
    { 
      id: "adoption", 
      label: "Adoption", 
      icon: Users,
      description: "Training & usage tracking",
      gradient: "from-emerald-500/5 to-teal-500/5",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600"
    },
    { 
      id: "value_realization", 
      label: "Value Realization", 
      icon: TrendingUp,
      description: "KPIs, health & reviews",
      gradient: "from-amber-500/5 to-orange-500/5",
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600"
    },
    { 
      id: "expansion", 
      label: "Expansion", 
      icon: Rocket,
      description: "Growth opportunities",
      gradient: "from-purple-500/5 to-pink-500/5",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600"
    },
    { 
      id: "advocacy", 
      label: "Advocacy", 
      icon: Star,
      description: "Success stories & referrals",
      gradient: "from-indigo-500/5 to-violet-500/5",
      borderColor: "border-indigo-500/20",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600"
    }
  ];

  const currentProjectStageIdx = lifecycleStages.findIndex(s => s.id === (project?.csLifecycleStage || "onboarding"));

  const renderDeliveryWorkspace = () => (
    <div className="space-y-6">
      {/* Lifecycle Stage Navigation */}
      <Card className="bg-gradient-to-r from-slate-500/5 to-gray-500/5 border-slate-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Customer Success Journey</h2>
              <p className="text-sm text-muted-foreground">Navigate through lifecycle stages</p>
            </div>
            <Badge variant="outline" className="text-indigo-600 border-indigo-300" data-testid="badge-lifecycle-stage">
              Current: {lifecycleStages.find(s => s.id === (project?.csLifecycleStage || "onboarding"))?.label}
            </Badge>
          </div>
          
          {/* Clickable Lifecycle Stages */}
          <div className="flex items-stretch gap-2">
            {lifecycleStages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isCurrentProjectStage = idx === currentProjectStageIdx;
              const isCompleted = idx < currentProjectStageIdx;
              const isSelected = activeLifecycleStage === stage.id;
              
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveLifecycleStage(stage.id)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all hover-elevate cursor-pointer ${
                    isSelected 
                      ? `bg-gradient-to-r ${stage.gradient} ${stage.borderColor} ring-2 ring-offset-2 ring-primary/30` 
                      : "bg-background border-border hover:border-primary/30"
                  }`}
                  data-testid={`lifecycle-nav-${stage.id}`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrentProjectStage ? "bg-indigo-600 text-white" :
                      isCompleted ? "bg-emerald-500 text-white" :
                      isSelected ? stage.iconBg : "bg-muted"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StageIcon className={`w-5 h-5 ${isCurrentProjectStage ? "text-white" : isSelected ? stage.iconColor : "text-muted-foreground"}`} />
                      )}
                      {isCurrentProjectStage && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-background animate-pulse" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs text-muted-foreground hidden lg:block">
                      {stage.description}
                    </span>
                  </div>
                  
                  {/* Progress connector */}
                  {idx < lifecycleStages.length - 1 && (
                    <div className={`absolute top-1/2 -right-3 w-4 h-0.5 hidden xl:block ${
                      isCompleted ? "bg-emerald-500" : "bg-muted"
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Link href={`/presentation-studio/${accountId}/${projectId}`} data-testid="delivery-presentation-studio">
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20 hover-elevate">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600">
            <Presentation className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Presentation Studio</p>
            <p className="text-xs text-muted-foreground">Generate AI-powered client decks</p>
          </div>
          <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-500/30 text-blue-600 bg-blue-500/5">AI</Badge>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>

      {/* Stage Content */}
      {activeLifecycleStage === "onboarding" && (
        <div className="space-y-6" data-testid="stage-onboarding">
          {/* Onboarding Header */}
          <Card className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Handshake className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Onboarding Stage</CardTitle>
                  <CardDescription>Accept handoffs, set up success plans, and kick off the engagement</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Incoming Handoffs */}
          <IncomingHandoffsTab projectId={projectId} project={project} />
          
          {/* Success Plan Setup (if initialized) */}
          <SuccessPlanTab projectId={projectId} project={project} />
          
          {/* Kickoff Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Kickoff Planning
              </CardTitle>
              <CardDescription>Schedule and prepare for the project kickoff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Kickoff Date</span>
                  </div>
                  <p className="text-lg font-semibold">{project?.kickoffDate ? new Date(project.kickoffDate).toLocaleDateString() : "Not scheduled"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Stakeholders</span>
                  </div>
                  <p className="text-lg font-semibold">{project?.stakeholders?.length || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Agreed Outcomes</span>
                  </div>
                  <p className="text-lg font-semibold">{kpis.filter(k => k.isSelected).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeLifecycleStage === "adoption" && (
        <div className="space-y-6" data-testid="stage-adoption">
          {/* Adoption Header */}
          <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Adoption Stage</CardTitle>
                  <CardDescription>Track user training, system usage, and early wins</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Training Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Training Progress
              </CardTitle>
              <CardDescription>Track stakeholder training completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Core Training Program</p>
                      <p className="text-sm text-muted-foreground">Essential skills and workflows</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">0%</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No training sessions tracked yet</p>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Training Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Usage Metrics
              </CardTitle>
              <CardDescription>Monitor system adoption and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-emerald-600">—</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-emerald-600">—</p>
                  <p className="text-sm text-muted-foreground">Sessions/Week</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-emerald-600">—</p>
                  <p className="text-sm text-muted-foreground">Feature Adoption</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Early Wins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Early Wins
              </CardTitle>
              <CardDescription>Capture quick wins to build momentum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-3">No early wins captured yet</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Capture Win
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeLifecycleStage === "value_realization" && (
        <div className="space-y-6" data-testid="stage-value-realization">
          {/* Value Realization Header */}
          <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Value Realization Stage</CardTitle>
                  <CardDescription>Track KPIs, monitor health, and conduct business reviews</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Health & Maturity Scores */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Health Score
              </CardTitle>
              <CardDescription>Composite engagement health indicator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray={`${((project?.healthScore || 100) / 100) * 251} 251`}
                      className={`${(project?.healthScore || 100) >= 70 ? "text-emerald-500" : (project?.healthScore || 100) >= 40 ? "text-amber-500" : "text-red-500"}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" data-testid="text-health-score">{project?.healthScore || 100}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Health Factors</p>
                  <div className="space-y-1">
                    {(project as any)?.healthFactors ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span>KPI Performance</span>
                          <Badge variant={(project as any).healthFactors.kpiPerformance >= 70 ? "default" : "secondary"}>
                            {(project as any).healthFactors.kpiPerformance}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Engagement Activity</span>
                          <Badge variant={(project as any).healthFactors.engagementActivity >= 70 ? "default" : "secondary"}>
                            {(project as any).healthFactors.engagementActivity}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Stakeholder Alignment</span>
                          <Badge variant={(project as any).healthFactors.stakeholderAlignment >= 70 ? "default" : "secondary"}>
                            {(project as any).healthFactors.stakeholderAlignment}%
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span>KPI Performance</span>
                          <Badge variant={kpisAtRisk === 0 ? "default" : "secondary"}>
                            {kpisAtRisk === 0 ? "Good" : "Needs Attention"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Engagement Activity</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Stakeholder Alignment</span>
                          <Badge variant="default">Aligned</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Maturity Score
              </CardTitle>
              <CardDescription>Customer success maturity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray={`${((project?.maturityScore || 0) / 100) * 251} 251`}
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" data-testid="text-maturity-score">{project?.maturityScore || 0}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Maturity Indicators</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Process Adoption</span>
                      <Progress value={(project?.maturityScore || 0) * 0.6} className="w-20 h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Value Realization</span>
                      <Progress value={(project?.maturityScore || 0) * 0.4} className="w-20 h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Self-Service</span>
                      <Progress value={(project?.maturityScore || 0) * 0.25} className="w-20 h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-emerald-500/20" data-demo-step="delivery-dashboard">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Outcome Health Summary</CardTitle>
                  <CardDescription>Real-time value delivery status</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Overall Status</p>
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

          {/* QBR Section */}
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

          {/* Trust Velocity Scorecard */}
          <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20" data-testid="trust-velocity-scorecard">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Trust Velocity Scorecard</CardTitle>
                  <CardDescription>Behavioral quality metrics for engagement health</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const blueSheetData = blueSheet?.data;
                const deliveryEvidenceItems = evidenceData?.items || [];
                const hasBlueSheetData = blueSheetData && (
                  blueSheetData.singleSalesObjective || 
                  (blueSheetData.buyingInfluences?.length || 0) > 0
                );
                
                const normalizeInfluenceRole = (inf: any): string => {
                  const roleValue = (inf.role || inf.type || "").toLowerCase().trim();
                  if (roleValue.includes("economic")) return "economic";
                  if (roleValue.includes("coach")) return "coach";
                  if (roleValue.includes("user")) return "user";
                  if (roleValue.includes("technical")) return "technical";
                  return roleValue;
                };
                
                const trustMetrics = [
                  {
                    id: "success_frame",
                    label: "Success Frame Clarity",
                    description: "How well outcomes are defined and understood",
                    score: kpis.length > 0 
                      ? Math.round((kpis.filter(k => k.targetValue && k.baselineValue).length / kpis.length) * 100)
                      : null,
                    icon: Target,
                    color: "emerald"
                  },
                  {
                    id: "method_adherence",
                    label: "Method Adherence",
                    description: "Following Miller Heiman strategic selling methodology",
                    score: (() => {
                      if (!hasBlueSheetData) return null;
                      let score = 0;
                      if (blueSheetData?.singleSalesObjective) score += 25;
                      if ((blueSheetData?.buyingInfluences?.length || 0) > 0) score += 25;
                      const redFlags = blueSheetData?.redFlags || blueSheetData?.summaryOfPositions?.filter((p: any) => p.type === "RedFlag") || [];
                      const strengths = blueSheetData?.strengthsLeverage || blueSheetData?.summaryOfPositions?.filter((p: any) => p.type !== "RedFlag") || [];
                      if (redFlags.length > 0 || (blueSheetData?.summaryOfPositions?.length || 0) > 0) score += 25;
                      if (strengths.length > 0 || (blueSheetData?.actionPlans?.length || 0) > 0) score += 25;
                      return score;
                    })(),
                    icon: ClipboardCheck,
                    color: "blue"
                  },
                  {
                    id: "sponsor_alignment",
                    label: "Sponsor Alignment",
                    description: "Executive sponsor engagement and buy-in",
                    score: (() => {
                      const influences = blueSheetData?.buyingInfluences || [];
                      if (influences.length === 0 && kpis.length === 0) return null;
                      const hasEconomicBuyer = influences.some((inf: any) => 
                        normalizeInfluenceRole(inf) === "economic"
                      );
                      const hasCoach = influences.some((inf: any) => 
                        normalizeInfluenceRole(inf) === "coach"
                      );
                      const confirmedOutcomes = kpis.filter(k => k.status === "on-track").length;
                      let score = 0;
                      if (hasEconomicBuyer) score += 40;
                      if (hasCoach) score += 20;
                      if (confirmedOutcomes > 0) score += 40;
                      return Math.min(100, score);
                    })(),
                    icon: Users,
                    color: "amber"
                  },
                  {
                    id: "handoff_completeness",
                    label: "Handoff Completeness",
                    description: "Quality of sales-to-delivery transition",
                    score: (() => {
                      let score = 0;
                      if (project?.handoffConfirmedAt) score += 40;
                      if (insights.length > 0) score += 20;
                      if (kpis.length > 0) score += 20;
                      if (deliveryEvidenceItems.length > 0) score += 20;
                      return score;
                    })(),
                    icon: Handshake,
                    color: "indigo"
                  }
                ];
                
                const validMetrics = trustMetrics.filter(m => m.score !== null);
                const overallScore = validMetrics.length > 0 
                  ? Math.round(validMetrics.reduce((sum, m) => sum + (m.score || 0), 0) / validMetrics.length)
                  : null;
                
                return (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/30 border">
                      <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-20 h-20 -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
                          {overallScore !== null && (
                            <circle 
                              cx="40" cy="40" r="32" 
                              stroke="currentColor" 
                              strokeWidth="6" 
                              fill="none" 
                              strokeDasharray={`${(overallScore / 100) * 201} 201`}
                              className={overallScore >= 70 ? "text-emerald-500" : overallScore >= 40 ? "text-amber-500" : "text-red-500"}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold" data-testid="text-trust-velocity-score">
                            {overallScore !== null ? overallScore : "—"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Overall Trust Velocity</h4>
                        <p className="text-sm text-muted-foreground">
                          {overallScore === null ? "Awaiting data to calculate score" :
                           overallScore >= 70 ? "Strong foundation for customer success" : 
                           overallScore >= 40 ? "Room for improvement in key areas" : 
                           "Critical gaps need attention"}
                        </p>
                        <Badge className={`mt-2 ${
                          overallScore === null ? "bg-muted text-muted-foreground border-muted" :
                          overallScore >= 70 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                          overallScore >= 40 ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                          "bg-red-500/10 text-red-600 border-red-500/30"
                        }`}>
                          {overallScore === null ? "No Data" : overallScore >= 70 ? "Healthy" : overallScore >= 40 ? "At Risk" : "Critical"}
                        </Badge>
                      </div>
                    </div>

                    {/* Individual Metrics */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {trustMetrics.map(metric => {
                        const MetricIcon = metric.icon;
                        const colorClasses = {
                          emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "text-emerald-500" },
                          blue: { bg: "bg-blue-500/10", text: "text-blue-600", ring: "text-blue-500" },
                          amber: { bg: "bg-amber-500/10", text: "text-amber-600", ring: "text-amber-500" },
                          indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600", ring: "text-indigo-500" }
                        }[metric.color];
                        
                        const scoreValue = metric.score ?? 0;
                        const isNoData = metric.score === null;
                        
                        return (
                          <div key={metric.id} className="p-4 rounded-lg border bg-background" data-testid={`trust-metric-${metric.id}`}>
                            <div className="flex items-start gap-4">
                              <div className="relative w-14 h-14 shrink-0">
                                <svg className="w-14 h-14 -rotate-90">
                                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                                  {!isNoData && (
                                    <circle 
                                      cx="28" cy="28" r="24" 
                                      stroke="currentColor" 
                                      strokeWidth="4" 
                                      fill="none" 
                                      strokeDasharray={`${(scoreValue / 100) * 150.8} 150.8`}
                                      className={colorClasses?.ring}
                                      strokeLinecap="round"
                                    />
                                  )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-bold">{isNoData ? "—" : Math.round(scoreValue)}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <MetricIcon className={`w-4 h-4 ${isNoData ? "text-muted-foreground" : colorClasses?.text}`} />
                                  <h5 className="font-medium text-sm">{metric.label}</h5>
                                </div>
                                <p className="text-xs text-muted-foreground">{metric.description}</p>
                                {isNoData ? (
                                  <Badge variant="outline" className="mt-2 text-xs text-muted-foreground">
                                    No data yet
                                  </Badge>
                                ) : scoreValue < 50 && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Needs attention
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Evidence Pack Management */}
          <Card data-testid="evidence-pack-management">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/10 via-amber-500/10 to-emerald-500/10 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Evidence Pack</CardTitle>
                    <CardDescription>Journey-based evidence organized by customer lifecycle phase</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Dual Audience View Toggle */}
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setEvidenceViewMode("coaching")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        evidenceViewMode === "coaching" 
                          ? "bg-background shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid="button-coaching-view"
                    >
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>Coaching</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setEvidenceViewMode("client")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        evidenceViewMode === "client" 
                          ? "bg-background shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid="button-client-view"
                    >
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>Client</span>
                      </div>
                    </button>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    {(evidenceData?.items || []).length} items
                  </Badge>
                  <Button size="sm" variant="outline" data-testid="button-add-evidence">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Evidence
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const allEvidence = evidenceData?.items || [];
                const leadingEvidence = allEvidence.filter((e: any) => e.journeyPhase === "leading");
                const midLoopEvidence = allEvidence.filter((e: any) => e.journeyPhase === "mid_loop" || e.journeyPhase === "mid-loop");
                const laggingEvidence = allEvidence.filter((e: any) => e.journeyPhase === "lagging");
                
                const phases = [
                  {
                    id: "leading",
                    label: "Leading",
                    subtitle: "Discovery Signals",
                    description: "Insights, stakeholder priorities, risk articulations",
                    items: leadingEvidence,
                    color: "blue",
                    icon: Search,
                    examples: ["Discovery insight", "Stakeholder priority", "Risk articulation", "Initial assessment"],
                    clientLabel: "Discovered",
                    clientDescription: "What we learned about your challenges"
                  },
                  {
                    id: "mid-loop",
                    label: "Mid-Loop",
                    subtitle: "Behavior Under Pressure",
                    description: "Assumption revisions, methodology compliance, sponsor alignment",
                    items: midLoopEvidence,
                    color: "amber",
                    icon: RefreshCw,
                    examples: ["Assumption revision", "Methodology metric", "Sponsor check-in", "Course correction"],
                    clientLabel: "Adapted",
                    clientDescription: "How we refined our approach together"
                  },
                  {
                    id: "lagging",
                    label: "Lagging",
                    subtitle: "Results with Context",
                    description: "KPI outcomes, success stories, reusability patterns",
                    items: laggingEvidence,
                    color: "emerald",
                    icon: Trophy,
                    examples: ["KPI result", "Success story", "Client testimonial", "ROI calculation"],
                    clientLabel: "Achieved",
                    clientDescription: "The results we delivered"
                  }
                ];
                
                // CLIENT VIEW - "The Value Story"
                if (evidenceViewMode === "client") {
                  return (
                    <div className="space-y-6">
                      {/* Value Story Header */}
                      <div className="text-center py-4 px-6 rounded-lg bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
                        <h3 className="text-xl font-semibold mb-2">The Value Story</h3>
                        <p className="text-sm text-muted-foreground">Your journey from discovery to results</p>
                      </div>

                      {/* Visual Journey Timeline */}
                      <div className="relative">
                        <div className="flex items-stretch gap-4">
                          {phases.map((phase, idx) => {
                            const PhaseIcon = phase.icon;
                            const hasItems = phase.items.length > 0;
                            const bgColors = {
                              blue: hasItems ? "bg-blue-500" : "bg-blue-500/30",
                              amber: hasItems ? "bg-amber-500" : "bg-amber-500/30",
                              emerald: hasItems ? "bg-emerald-500" : "bg-emerald-500/30"
                            };
                            
                            return (
                              <div key={phase.id} className="flex-1 relative">
                                {/* Connection Arrow */}
                                {idx < phases.length - 1 && (
                                  <div className="absolute top-8 -right-2 z-10">
                                    <ArrowRight className={`w-4 h-4 ${hasItems ? "text-muted-foreground" : "text-muted"}`} />
                                  </div>
                                )}
                                
                                <div className={`p-5 rounded-xl border-2 ${hasItems ? "border-primary/20 bg-card" : "border-dashed border-muted bg-muted/20"}`}>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColors[phase.color as keyof typeof bgColors]} text-white`}>
                                      <PhaseIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{phase.clientLabel}</h4>
                                      <p className="text-xs text-muted-foreground">{phase.clientDescription}</p>
                                    </div>
                                  </div>
                                  
                                  {phase.items.length > 0 ? (
                                    <div className="space-y-2">
                                      {phase.items.slice(0, 2).map((item: any) => (
                                        <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                                          <p className="text-sm font-medium">{item.title}</p>
                                          {item.whatThisProves && (
                                            <p className="text-xs text-muted-foreground mt-1">{item.whatThisProves}</p>
                                          )}
                                        </div>
                                      ))}
                                      {phase.items.length > 2 && (
                                        <p className="text-xs text-center text-muted-foreground">
                                          +{phase.items.length - 2} more highlights
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                      Evidence to be captured
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Key Metrics Summary */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
                          <p className="text-3xl font-bold text-blue-600">{leadingEvidence.length}</p>
                          <p className="text-sm text-muted-foreground">Key Insights</p>
                        </div>
                        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                          <p className="text-3xl font-bold text-amber-600">{midLoopEvidence.length}</p>
                          <p className="text-sm text-muted-foreground">Adaptations Made</p>
                        </div>
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                          <p className="text-3xl font-bold text-emerald-600">{laggingEvidence.length}</p>
                          <p className="text-sm text-muted-foreground">Results Delivered</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // COACHING VIEW - Phase-based with story thread connectors
                return (
                  <div className="space-y-4">
                    {/* Phase Flow Visualization */}
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/30 border">
                      {phases.map((phase, idx) => {
                        const PhaseIcon = phase.icon;
                        const colorClasses = {
                          blue: "bg-blue-500/10 text-blue-600 border-blue-500/30",
                          amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
                          emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        }[phase.color];
                        
                        return (
                          <div key={phase.id} className="flex items-center gap-2 flex-1">
                            <div className={`flex-1 p-3 rounded-lg border ${colorClasses}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <PhaseIcon className="w-4 h-4" />
                                <span className="font-medium text-sm">{phase.label}</span>
                              </div>
                              <p className="text-xs opacity-80">{phase.items.length} items</p>
                            </div>
                            {idx < phases.length - 1 && (
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground mb-0.5">Leads to</span>
                                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Phase Cards */}
                    <div className="grid gap-4 lg:grid-cols-3">
                      {phases.map(phase => {
                        const PhaseIcon = phase.icon;
                        const bgColor = {
                          blue: "from-blue-500/5 to-cyan-500/5 border-blue-500/20",
                          amber: "from-amber-500/5 to-orange-500/5 border-amber-500/20",
                          emerald: "from-emerald-500/5 to-teal-500/5 border-emerald-500/20"
                        }[phase.color];
                        const iconColor = {
                          blue: "text-blue-600",
                          amber: "text-amber-600",
                          emerald: "text-emerald-600"
                        }[phase.color];
                        
                        return (
                          <div key={phase.id} className={`p-4 rounded-lg border bg-gradient-to-br ${bgColor}`} data-testid={`evidence-phase-${phase.id}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <PhaseIcon className={`w-5 h-5 ${iconColor}`} />
                              <div>
                                <h4 className="font-medium">{phase.label}</h4>
                                <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{phase.description}</p>
                            
                            {phase.items.length > 0 ? (
                              <div className="space-y-2">
                                {phase.items.slice(0, 3).map((item: any) => (
                                  <div key={item.id} className="p-2 rounded bg-background/50 border text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs shrink-0">
                                        {item.evidenceType?.replace(/_/g, ' ')}
                                      </Badge>
                                      <span className="truncate text-xs">{item.title}</span>
                                    </div>
                                  </div>
                                ))}
                                {phase.items.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{phase.items.length - 3} more
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-xs text-muted-foreground mb-2">No evidence yet</p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {phase.examples.slice(0, 2).map(ex => (
                                    <Badge key={ex} variant="outline" className="text-xs opacity-50">
                                      {ex}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Story Thread Indicator */}
                    {leadingEvidence.length > 0 && midLoopEvidence.length > 0 && laggingEvidence.length > 0 && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Complete journey documented</span>
                        <span className="text-xs text-emerald-600 ml-auto">Ready for storytelling</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Timeline */}
          <InteractiveTimeline 
            projectId={projectId} 
            companyName={project?.companyName}
          />
        </div>
      )}

      {activeLifecycleStage === "expansion" && (
        <div className="space-y-6" data-testid="stage-expansion">
          {/* Expansion Header */}
          <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Expansion Stage</CardTitle>
                  <CardDescription>Identify growth opportunities and upsell potential</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Growth Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Growth Opportunities
              </CardTitle>
              <CardDescription>AI-identified expansion possibilities based on engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Additional Department Rollout</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600">High Potential</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on current adoption success, 3 additional departments could benefit from similar implementation.</p>
                </div>
                <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Advanced Feature Adoption</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600">Medium Potential</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Customer is ready for advanced analytics and automation features.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upsell Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Expansion Pipeline
              </CardTitle>
              <CardDescription>Track upsell and cross-sell opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-3">No expansion opportunities tracked yet</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Opportunity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Growth Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Account Growth Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-purple-600">—</p>
                  <p className="text-sm text-muted-foreground">NPS Score</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-purple-600">—</p>
                  <p className="text-sm text-muted-foreground">Expansion Likelihood</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-purple-600">$0</p>
                  <p className="text-sm text-muted-foreground">Pipeline Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeLifecycleStage === "advocacy" && (
        <div className="space-y-6" data-testid="stage-advocacy">
          {/* Advocacy Header */}
          <Card className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Advocacy Stage</CardTitle>
                  <CardDescription>Capture success stories, testimonials, and referrals</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Success Stories */}
          <SuccessPlanTab projectId={projectId} project={project} />

          {/* Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                Testimonials
              </CardTitle>
              <CardDescription>Collect and manage customer testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-3">No testimonials collected yet</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Testimonial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Case Studies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Case Studies
              </CardTitle>
              <CardDescription>Build case studies from successful outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-3">No case studies created yet</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Case Study
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Referrals
              </CardTitle>
              <CardDescription>Track customer referrals and introductions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-indigo-600">0</p>
                  <p className="text-sm text-muted-foreground">Referrals Made</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-indigo-600">0</p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <p className="text-3xl font-bold text-indigo-600">$0</p>
                  <p className="text-sm text-muted-foreground">Referral Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
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
                  Full Initiative
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

      {/* Document Enrichment Results Dialog */}
      <Dialog open={showDocumentEnrichDialog} onOpenChange={setShowDocumentEnrichDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Green Sheet Suggestions from Documents
            </DialogTitle>
            <DialogDescription>
              AI has analyzed your pre-meeting documents and generated suggestions for the Green Sheet.
            </DialogDescription>
          </DialogHeader>
          
          {documentEnrichmentResult && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Sources */}
              {documentEnrichmentResult.sourcedFrom.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Sourced from:</span>
                  {documentEnrichmentResult.sourcedFrom.map((source, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{source}</Badge>
                  ))}
                </div>
              )}
              
              {/* Call Planner Suggestions */}
              <div className="p-4 rounded-lg border-2 border-emerald-500/30 bg-emerald-50/50">
                <h4 className="font-semibold text-sm text-emerald-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Call Planner Suggestions
                </h4>
                <div className="grid gap-3">
                  {documentEnrichmentResult.callPlanner.objective && (
                    <div className="p-2 rounded border bg-white">
                      <Label className="text-xs text-muted-foreground">Call Objective</Label>
                      <p className="text-sm mt-1">{documentEnrichmentResult.callPlanner.objective}</p>
                    </div>
                  )}
                  {documentEnrichmentResult.callPlanner.desiredOutcome && (
                    <div className="p-2 rounded border bg-white">
                      <Label className="text-xs text-muted-foreground">Desired Outcome</Label>
                      <p className="text-sm mt-1">{documentEnrichmentResult.callPlanner.desiredOutcome}</p>
                    </div>
                  )}
                  {documentEnrichmentResult.callPlanner.openingStatement && (
                    <div className="p-2 rounded border bg-white">
                      <Label className="text-xs text-muted-foreground">Opening Statement</Label>
                      <p className="text-sm mt-1">{documentEnrichmentResult.callPlanner.openingStatement}</p>
                    </div>
                  )}
                  {documentEnrichmentResult.callPlanner.bestActionCommitment && (
                    <div className="p-2 rounded border bg-white">
                      <Label className="text-xs text-muted-foreground">Best Action Commitment</Label>
                      <p className="text-sm mt-1">{documentEnrichmentResult.callPlanner.bestActionCommitment}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Suggestions */}
              {(documentEnrichmentResult.meetingContact.name || documentEnrichmentResult.meetingContact.knownConcerns) && (
                <div className="p-4 rounded-lg border-2 border-blue-500/30 bg-blue-50/50">
                  <h4 className="font-semibold text-sm text-blue-800 mb-3 flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Contact Suggestions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {documentEnrichmentResult.meetingContact.name && (
                      <div className="p-2 rounded border bg-white">
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="text-sm mt-1">{documentEnrichmentResult.meetingContact.name}</p>
                      </div>
                    )}
                    {documentEnrichmentResult.meetingContact.title && (
                      <div className="p-2 rounded border bg-white">
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <p className="text-sm mt-1">{documentEnrichmentResult.meetingContact.title}</p>
                      </div>
                    )}
                    {documentEnrichmentResult.meetingContact.knownConcerns && (
                      <div className="col-span-2 p-2 rounded border bg-white">
                        <Label className="text-xs text-muted-foreground">Known Concerns</Label>
                        <p className="text-sm mt-1">{documentEnrichmentResult.meetingContact.knownConcerns}</p>
                      </div>
                    )}
                    {documentEnrichmentResult.meetingContact.decisionCriteria && (
                      <div className="col-span-2 p-2 rounded border bg-white">
                        <Label className="text-xs text-muted-foreground">Decision Criteria</Label>
                        <p className="text-sm mt-1">{documentEnrichmentResult.meetingContact.decisionCriteria}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDocumentEnrichDialog(false)}>
              Cancel
            </Button>
            <Button onClick={applyDocumentEnrichment} className="gap-2 bg-emerald-600 hover:bg-emerald-700" data-testid="button-apply-document-enrichment">
              <CheckCircle className="w-4 h-4" />
              Apply to Green Sheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Attendee Dialog for Multiple Attendees Mode */}
      <Dialog open={showAddAttendeeDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingAttendee(null);
          setAttendeeResearchResult(null);
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
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Sarah Chen"
                    value={editingAttendee?.name || ""}
                    onChange={(e) => setEditingAttendee(prev => prev ? { ...prev, name: e.target.value } : { id: `temp-${Date.now()}`, name: e.target.value, title: "", affiliation: "client", role: undefined, influence: undefined, knownConcerns: "", personalRapport: "" })}
                    className="h-9 flex-1"
                    data-testid="input-attendee-name"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={!editingAttendee?.name || isResearchingAttendee}
                    onClick={async () => {
                      if (!editingAttendee?.name || !project?.id) return;
                      setIsResearchingAttendee(true);
                      setAttendeeResearchResult(null);
                      try {
                        const response = await apiRequest(`/api/projects/${project.id}/ai/research-attendee`, {
                          method: "POST",
                          body: JSON.stringify({
                            attendeeName: editingAttendee.name,
                            companyName: project.companyName,
                            knownTitle: editingAttendee.title
                          })
                        });
                        setAttendeeResearchResult(response);
                        if (response.title && !editingAttendee.title) {
                          setEditingAttendee(prev => prev ? { ...prev, title: response.title } : null);
                        }
                        if (response.knownConcerns && !editingAttendee.knownConcerns) {
                          setEditingAttendee(prev => prev ? { ...prev, knownConcerns: response.knownConcerns } : null);
                        }
                      } catch (error) {
                        console.error("Attendee research failed:", error);
                      } finally {
                        setIsResearchingAttendee(false);
                      }
                    }}
                    data-testid="button-research-attendee"
                  >
                    {isResearchingAttendee ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Research</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Affiliation *</Label>
                <Select
                  value={editingAttendee?.affiliation || "client"}
                  onValueChange={(v) => setEditingAttendee(prev => prev ? { 
                    ...prev, 
                    affiliation: v as Affiliation,
                    // Reset role when affiliation changes since client/internal have different role options
                    role: undefined 
                  } : null)}
                >
                  <SelectTrigger className="h-9" data-testid="select-attendee-affiliation">
                    <SelectValue placeholder="Select side..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client (Customer Side)</SelectItem>
                    <SelectItem value="internal">Internal (Korn Ferry)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              {(editingAttendee?.affiliation || "client") === "client" ? (
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
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Internal Role</Label>
                  <Select
                    value={editingAttendee?.role || undefined}
                    onValueChange={(v) => setEditingAttendee(prev => prev ? { ...prev, role: v as any } : null)}
                  >
                    <SelectTrigger className="h-9" data-testid="select-attendee-internal-role">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account_lead">Account Lead</SelectItem>
                      <SelectItem value="delivery_lead">Delivery Lead</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="subject_expert">Subject Matter Expert</SelectItem>
                      <SelectItem value="executive_sponsor">Executive Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {(editingAttendee?.affiliation || "client") === "client" && (
            <div className="grid gap-4 md:grid-cols-2">
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
            )}

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

            {attendeeResearchResult && attendeeResearchResult.isLive && (
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-800" data-testid="card-attendee-research">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Research Results</span>
                  {attendeeResearchResult.linkedInDataFound && (
                    <Badge variant="outline" className="text-[10px] bg-blue-600 text-white border-blue-600" data-testid="badge-linkedin-found">
                      LinkedIn Verified
                    </Badge>
                  )}
                  {attendeeResearchResult.retrievedAt && !attendeeResearchResult.linkedInDataFound && (
                    <Badge variant="outline" className="text-[10px]" data-testid="badge-research-live">
                      Web Data
                    </Badge>
                  )}
                </div>
                
                {attendeeResearchResult.linkedInProfileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full justify-start gap-2 mb-3"
                    data-testid="link-linkedin-profile"
                  >
                    <a 
                      href={attendeeResearchResult.linkedInProfileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
                      <span className="text-xs font-medium">View LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                )}
                
                {attendeeResearchResult.linkedInHeadline && (
                  <div className="mb-2 p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium text-foreground" data-testid="text-linkedin-headline">
                      {attendeeResearchResult.linkedInHeadline}
                    </p>
                  </div>
                )}
                
                {attendeeResearchResult.linkedInEducation?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Education
                    </p>
                    <ul className="text-xs space-y-0.5" data-testid="list-linkedin-education">
                      {attendeeResearchResult.linkedInEducation.map((edu: string, i: number) => (
                        <li key={i} className="text-muted-foreground" data-testid={`text-education-${i}`}>• {edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {attendeeResearchResult.linkedInSkills?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Skills & Expertise</p>
                    <div className="flex flex-wrap gap-1" data-testid="list-linkedin-skills">
                      {attendeeResearchResult.linkedInSkills.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px]" data-testid={`badge-skill-${i}`}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {attendeeResearchResult.background && (
                  <p className="text-xs text-muted-foreground mb-2" data-testid="text-attendee-research-background">
                    {attendeeResearchResult.background}
                  </p>
                )}
                {attendeeResearchResult.careerHistory?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Career History</p>
                    <ul className="text-xs space-y-0.5" data-testid="list-attendee-career-history">
                      {attendeeResearchResult.careerHistory.slice(0, 3).map((item: string, i: number) => (
                        <li key={i} className="text-muted-foreground" data-testid={`text-career-item-${i}`}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {attendeeResearchResult.coachingTips?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Coaching Tips</p>
                    <ul className="text-xs space-y-0.5" data-testid="list-attendee-coaching-tips">
                      {attendeeResearchResult.coachingTips.map((tip: string, i: number) => (
                        <li key={i} className="text-emerald-700 dark:text-emerald-400" data-testid={`text-coaching-tip-${i}`}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {attendeeResearchResult.citations?.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground" data-testid="text-attendee-research-sources">
                      Sources: {attendeeResearchResult.citations.slice(0, 3).map((c: string) => {
                        try { return new URL(c).hostname; } catch { return c; }
                      }).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setEditingAttendee(null);
              setAttendeeResearchResult(null);
              setShowAddAttendeeDialog(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingAttendee?.name) {
                  // Check if editing existing attendee (has a stable ID that exists in the list)
                  const existingAttendee = editingAttendee.id && meetingAttendees.find(a => a.id === editingAttendee.id);
                  if (existingAttendee) {
                    // Update existing attendee by ID, preserving all existing data
                    setMeetingAttendees(prev => prev.map(a => {
                      if (a.id === editingAttendee.id) {
                        return { ...a, ...editingAttendee };
                      }
                      return a;
                    }));
                  } else {
                    // Adding new attendee - generate a stable ID
                    const stableId = `attendee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    setMeetingAttendees(prev => [...prev, { ...editingAttendee, id: stableId }]);
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
              {editingAttendee?.id && meetingAttendees.find(a => a.id === editingAttendee.id) ? "Update Attendee" : "Add Attendee"}
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        {question.targetAudience === "all" ? (
                          <Badge variant="outline" className="text-[10px] bg-slate-500/10 text-slate-600 border-slate-500/30" data-testid={`badge-audience-all-${question.id}`}>
                            All Attendees
                          </Badge>
                        ) : question.targetAttendeeNames && question.targetAttendeeNames.length > 0 ? (
                          question.targetAttendeeNames.map((name, idx) => (
                            <Badge 
                              key={idx}
                              variant="outline" 
                              className="text-[10px] bg-indigo-500/10 text-indigo-700 border-indigo-500/30"
                              data-testid={`badge-attendee-${question.id}-${idx}`}
                            >
                              {name}
                            </Badge>
                          ))
                        ) : null}
                      </div>
                      <p className="text-sm font-medium">{question.question}</p>
                      {question.rationale && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="text-violet-600">Why:</span> {question.rationale}
                        </p>
                      )}
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

          {/* CRO/CFO Success Frame - KPI Context */}
          {(() => {
            const kpiOutcomes = (commitments as any[]).filter(c => 
              (c.status === "client_confirmed" || c.status === "proposed" || c.status === "draft") && 
              (c.baselineValue != null || c.targetValue != null)
            ).slice(0, 5);
            if (kpiOutcomes.length === 0) return null;
            return (
              <div className="p-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 mt-3" data-testid="panel-success-frame">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">CRO Success Frame</span>
                  <span className="text-[10px] text-slate-400 ml-auto">What success looks like</span>
                </div>
                <div className="grid gap-1.5">
                  {kpiOutcomes.map((kpi: any) => (
                    <div key={kpi.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate flex-1">{kpi.kpiMetric || kpi.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400">{kpi.baselineValue ?? "—"}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{kpi.targetValue ?? "—"}</span>
                        {kpi.kpiUnit && <span className="text-slate-500 text-[10px]">{kpi.kpiUnit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
