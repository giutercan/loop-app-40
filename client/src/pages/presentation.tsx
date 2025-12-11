import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Target,
  Brain,
  Users,
  TrendingUp,
  Shield,
  Gauge,
  Zap,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  BarChart3,
  Handshake,
  Lightbulb,
  Search,
  ClipboardCheck,
  LineChart,
  Building2,
  UserCheck,
  Rocket
} from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: JSX.Element;
  background?: string;
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    // Title Slide
    {
      id: "title",
      title: "",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-500 flex items-center justify-center mb-4">
            <Layers className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent mb-4">
              Korn Ferry Loop
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Transforming how Korn Ferry sells, delivers, and proves value
            </p>
          </div>
          <div className="flex items-center gap-4 mt-8">
            <Badge variant="outline" className="text-base px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Role-Based
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Outcome-Focused
            </Badge>
          </div>
        </div>
      ),
      background: "from-violet-500/5 via-blue-500/5 to-emerald-500/5"
    },

    // The Problem
    {
      id: "problem",
      title: "The Challenge",
      subtitle: "What we heard from the field",
      content: (
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-lg">Discovery is Manual</h3>
              </div>
              <p className="text-muted-foreground">
                Hours spent on company research, scattered notes, and missed insights that could drive value conversations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg">Value Gets Lost</h3>
              </div>
              <p className="text-muted-foreground">
                Promises made in sales don't always translate to delivery. No clear tracking of committed outcomes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">Siloed Conversations</h3>
              </div>
              <p className="text-muted-foreground">
                Sales, delivery, and client sponsors operate in different systems with no shared view of value.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-rose-500/5 border-rose-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="font-semibold text-lg">Hard to Prove ROI</h3>
              </div>
              <p className="text-muted-foreground">
                At renewal time, teams struggle to articulate the value delivered with concrete, trackable metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },

    // The Vision
    {
      id: "vision",
      title: "Our Vision",
      subtitle: "A unified platform for the entire value loop",
      content: (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One platform where every team—from sales to delivery to client sponsors—can 
              <span className="text-foreground font-medium"> discover, align, and realize value together.</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex flex-col items-center p-6 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Search className="w-8 h-8 text-violet-500 mb-3" />
              <span className="font-semibold">Discover</span>
              <span className="text-sm text-muted-foreground">AI-powered research</span>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            <div className="flex flex-col items-center p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Target className="w-8 h-8 text-blue-500 mb-3" />
              <span className="font-semibold">Align</span>
              <span className="text-sm text-muted-foreground">Collaborative outcomes</span>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            <div className="flex flex-col items-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
              <span className="font-semibold">Realize</span>
              <span className="text-sm text-muted-foreground">Tracked & proven</span>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-emerald-500/5 border text-center">
            <p className="text-lg font-medium">
              "From first conversation to proven impact—<br/>
              <span className="text-muted-foreground">one continuous thread of value."</span>
            </p>
          </div>
        </div>
      )
    },

    // Value Framework
    {
      id: "framework",
      title: "The 4 Value Pillars",
      subtitle: "Every Korn Ferry solution maps to measurable business impact",
      content: (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="bg-emerald-500/5 border-emerald-500/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-emerald-600">Grow</h3>
                  <p className="text-sm text-muted-foreground">Revenue & Market Share</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Revenue growth</Badge>
                <Badge variant="secondary">Market expansion</Badge>
                <Badge variant="secondary">Innovation</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-blue-600">Optimise</h3>
                  <p className="text-sm text-muted-foreground">Productivity & Efficiency</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Cost reduction</Badge>
                <Badge variant="secondary">Process efficiency</Badge>
                <Badge variant="secondary">Time-to-market</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-amber-600">De-risk</h3>
                  <p className="text-sm text-muted-foreground">Retention & Compliance</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Turnover reduction</Badge>
                <Badge variant="secondary">Succession readiness</Badge>
                <Badge variant="secondary">Risk mitigation</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-violet-500/5 border-violet-500/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-violet-600">Strengthen</h3>
                  <p className="text-sm text-muted-foreground">Leadership & Culture</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Leadership pipeline</Badge>
                <Badge variant="secondary">Culture shift</Badge>
                <Badge variant="secondary">Skills development</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    // AI-Powered Discovery
    {
      id: "discovery",
      title: "AI-Powered Discovery",
      subtitle: "From hours of research to minutes of insight",
      content: (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">GPT-4o Research</h3>
              <p className="text-sm text-muted-foreground">
                Instant company intelligence, strategic insights, and industry benchmarks
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Methodology Questions</h3>
              <p className="text-sm text-muted-foreground">
                SPIN, Miller Heiman, PSS—AI generates the right questions for each contact
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Insight Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Auto-classifies insights by priority, confidence, and Korn Ferry solution fit
              </p>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-violet-500/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Interactive Green Sheet</h3>
                  <p className="text-muted-foreground">
                    Identify meeting contacts with buying roles and influence levels. Get role-based coaching 
                    for Economic Buyers, User Buyers, Technical Buyers, Coaches, and Champions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Call objectives</Badge>
                    <Badge>Desired outcomes</Badge>
                    <Badge>Opening statements</Badge>
                    <Badge>Best action commitments</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    // Collaborative Alignment
    {
      id: "alignment",
      title: "Collaborative Alignment",
      subtitle: "Sales and clients co-create measurable outcomes",
      content: (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Design Outcomes (Internal)</h3>
                  <p className="text-sm text-muted-foreground">Draft and refine before sharing</p>
                </div>
              </div>
              <Card className="p-4 bg-violet-500/5 border-violet-500/20">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                    AI-suggested outcomes from discovery
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                    Link to success stories & benchmarks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                    Value calculation with industry baselines
                  </li>
                </ul>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Client Alignment (Shareable)</h3>
                  <p className="text-sm text-muted-foreground">Secure link for client review</p>
                </div>
              </div>
              <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Token-based secure sharing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Client confirms or adjusts outcomes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Real-time status: Shared, Awaiting, Confirmed
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-emerald-500/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Unified Value Journey</h3>
                  <p className="text-sm text-muted-foreground">Visual timeline showing all confirmed outcomes grouped by implementation horizon</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Example Total Value</p>
                <p className="text-2xl font-bold text-emerald-600">$12.5M</p>
              </div>
            </div>
          </Card>
        </div>
      )
    },

    // Seamless Handoff
    {
      id: "handoff",
      title: "Seamless Handoff",
      subtitle: "Sales to delivery without losing context",
      content: (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Card className="p-6 text-center bg-violet-500/5 border-violet-500/20">
              <Building2 className="w-10 h-10 text-violet-500 mx-auto mb-3" />
              <h3 className="font-semibold">Sales</h3>
              <p className="text-sm text-muted-foreground">Bundles confirmed outcomes</p>
            </Card>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-border" />
              <ArrowRight className="w-6 h-6 text-primary" />
              <div className="h-px w-8 bg-border" />
            </div>
            <Card className="p-6 text-center bg-emerald-500/5 border-emerald-500/20">
              <UserCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold">Delivery</h3>
              <p className="text-sm text-muted-foreground">Receives full context</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                    <ClipboardCheck className="w-6 h-6 text-violet-500" />
                  </div>
                  <h4 className="font-medium mb-1">Select & Bundle</h4>
                  <p className="text-sm text-muted-foreground">Choose confirmed outcomes for handoff</p>
                </div>
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium mb-1">Context Transfer</h4>
                  <p className="text-sm text-muted-foreground">All discovery, notes, and commitments</p>
                </div>
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="font-medium mb-1">Instant Accept</h4>
                  <p className="text-sm text-muted-foreground">Delivery team accepts & begins tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-medium">
              No more "what did sales promise?"—<br/>
              <span className="text-muted-foreground">Every outcome is documented and trackable.</span>
            </p>
          </div>
        </div>
      )
    },

    // Value Realization
    {
      id: "realization",
      title: "Value Realization",
      subtitle: "Track, prove, and celebrate delivered impact",
      content: (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4 text-center bg-emerald-500/5 border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-semibold text-emerald-600">On Track</h4>
              <p className="text-xs text-muted-foreground">80%+ progress</p>
            </Card>
            <Card className="p-4 text-center bg-amber-500/5 border-amber-500/20">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="font-semibold text-amber-600">At Risk</h4>
              <p className="text-xs text-muted-foreground">50-79% progress</p>
            </Card>
            <Card className="p-4 text-center bg-red-500/5 border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-red-600">Off Track</h4>
              <p className="text-xs text-muted-foreground">&lt;50% progress</p>
            </Card>
            <Card className="p-4 text-center bg-slate-500/5 border-slate-500/20">
              <BarChart3 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-600">Needs Data</h4>
              <p className="text-xs text-muted-foreground">Awaiting input</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <LineChart className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-lg">KPI Progress Tracking</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Baseline → Current → Target visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Industry benchmark comparisons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>AI-generated next steps when at risk</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-violet-500" />
                <h3 className="font-semibold text-lg">Success Story Library</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Verified case studies by industry & solution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Link realized value to success stories</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Build QBR narratives with proven examples</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )
    },

    // Impact & Benefits
    {
      id: "impact",
      title: "The Impact",
      subtitle: "What this means for Korn Ferry teams",
      content: (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-violet-600 mb-2">60%</div>
              <p className="text-sm text-muted-foreground">Less time on manual research with AI-powered discovery</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Visibility into promised vs. delivered outcomes</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">1 Platform</div>
              <p className="text-sm text-muted-foreground">Single source of truth across the value loop</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-500" />
                    For Sales Teams
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Faster discovery with AI research & coaching
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Methodology-driven questioning (SPIN, Miller Heiman)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Client-facing alignment links
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Clean handoff to delivery
                    </li>
                  </ul>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                    For Delivery Teams
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Full context from sales conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Clear KPIs with baselines & targets
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Health scoring for proactive intervention
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      QBR-ready value narratives
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    // Call to Action
    {
      id: "cta",
      title: "",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-500 flex items-center justify-center mb-4">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Transform Value Delivery?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Korn Ferry Loop is built by Korn Ferry, for Korn Ferry—
              helping every team prove and maximize client impact.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Home className="w-5 h-5" />
                Explore the Platform
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setCurrentSlide(0)}>
              <ChevronLeft className="w-5 h-5" />
              Restart Presentation
            </Button>
          </div>
        </div>
      ),
      background: "from-violet-500/5 via-blue-500/5 to-emerald-500/5"
    }
  ];

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
            <Home className="w-4 h-4" />
            Back to App
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentSlide + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>
      </header>

      {/* Slide Content */}
      <main 
        className={`flex-1 flex flex-col p-8 md:p-16 overflow-y-auto bg-gradient-to-br ${currentSlideData.background || ''}`}
        onClick={() => nextSlide()}
        data-testid="slide-content"
      >
        {currentSlideData.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{currentSlideData.title}</h2>
            {currentSlideData.subtitle && (
              <p className="text-lg text-muted-foreground">{currentSlideData.subtitle}</p>
            )}
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          {currentSlideData.content}
        </div>
      </main>

      {/* Navigation */}
      <footer className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <Button
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          disabled={currentSlide === 0}
          className="gap-2"
          data-testid="button-prev-slide"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-1">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              data-testid={`button-slide-dot-${index}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          disabled={currentSlide === slides.length - 1}
          className="gap-2"
          data-testid="button-next-slide"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
}
