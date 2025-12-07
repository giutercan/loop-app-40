import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";

export interface ProactiveInsight {
  id: string;
  type: "recommendation" | "tip" | "warning" | "action";
  category: "kpi" | "discovery" | "alignment" | "meeting" | "handoff" | "general";
  title: string;
  description: string;
  actionLabel?: string;
  actionPrompt?: string;
  priority: number;
  contextMatch: number;
  dismissed?: boolean;
}

interface UseProactiveInsightsOptions {
  accountId?: number;
  projectId?: number;
  enabled?: boolean;
  maxInsights?: number;
}

interface RouteContext {
  phase: "discovery" | "alignment" | "realisation" | "account" | "global";
  hasAccount: boolean;
  hasProject: boolean;
  isOnboarding: boolean;
  isSalesWorkspace: boolean;
  isDeliveryWorkspace: boolean;
}

function parseRouteContext(location: string): RouteContext {
  const hasAccount = /\/accounts\/\d+/.test(location);
  const hasProject = /\/projects\/\d+/.test(location);
  const isSalesWorkspace = location.includes("/sales");
  const isDeliveryWorkspace = location.includes("/delivery");
  
  let phase: RouteContext["phase"] = "global";
  if (location.includes("/discovery")) phase = "discovery";
  else if (location.includes("/alignment")) phase = "alignment";
  else if (location.includes("/realisation") || location.includes("/dashboard")) phase = "realisation";
  else if (hasAccount) phase = "account";
  
  return {
    phase,
    hasAccount,
    hasProject,
    isOnboarding: location.includes("/onboarding") || location === "/",
    isSalesWorkspace,
    isDeliveryWorkspace,
  };
}

function generateContextualInsights(context: RouteContext, accountId?: number, projectId?: number): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];
  
  if (context.phase === "discovery" && projectId) {
    insights.push({
      id: "discovery-questions",
      type: "recommendation",
      category: "discovery",
      title: "Discovery Questions",
      description: "Get AI-powered questions tailored to your client's industry and challenges.",
      actionLabel: "Generate questions",
      actionPrompt: "Suggest discovery questions for this project based on the industry and context",
      priority: 90,
      contextMatch: 95,
    });
    
    insights.push({
      id: "research-company",
      type: "tip",
      category: "discovery",
      title: "AI Research Available",
      description: "Run AI research to get strategic insights about your client's business challenges.",
      actionLabel: "Run research",
      actionPrompt: "Run AI research on this account and summarize key strategic insights",
      priority: 85,
      contextMatch: 90,
    });
    
    insights.push({
      id: "meeting-prep",
      type: "action",
      category: "meeting",
      title: "Prepare for Discovery Call",
      description: "Generate a meeting bundle with talking points and suggested agenda.",
      actionLabel: "Prepare bundle",
      actionPrompt: "Help me prepare for a discovery meeting with this client",
      priority: 80,
      contextMatch: 85,
    });
  }
  
  if (context.phase === "alignment" && projectId) {
    insights.push({
      id: "kpi-recommendations",
      type: "recommendation",
      category: "kpi",
      title: "KPI Recommendations",
      description: "Get AI suggestions for KPIs based on your strategic priorities and job themes.",
      actionLabel: "Suggest KPIs",
      actionPrompt: "Recommend KPIs for this initiative based on the current job themes and priorities",
      priority: 95,
      contextMatch: 95,
    });
    
    insights.push({
      id: "success-stories",
      type: "tip",
      category: "alignment",
      title: "Relevant Success Stories",
      description: "Find case studies that match your client's industry and value pillars.",
      actionLabel: "Find stories",
      actionPrompt: "Find success stories relevant to this project's industry and KPIs",
      priority: 75,
      contextMatch: 80,
    });
    
    insights.push({
      id: "value-narrative",
      type: "action",
      category: "alignment",
      title: "Generate Value Narrative",
      description: "Create compelling value justification for stakeholder presentations.",
      actionLabel: "Create narrative",
      actionPrompt: "Generate a value narrative for this initiative suitable for executive presentation",
      priority: 70,
      contextMatch: 75,
    });
  }
  
  if (context.phase === "realisation" && projectId) {
    insights.push({
      id: "kpi-progress",
      type: "recommendation",
      category: "kpi",
      title: "Track KPI Progress",
      description: "Review current KPI performance and identify areas needing attention.",
      actionLabel: "Check progress",
      actionPrompt: "Show me the current progress on all KPIs for this initiative",
      priority: 90,
      contextMatch: 95,
    });
    
    insights.push({
      id: "qbr-prep",
      type: "action",
      category: "meeting",
      title: "Prepare QBR",
      description: "Generate a comprehensive quarterly business review package.",
      actionLabel: "Prepare QBR",
      actionPrompt: "Help me prepare a quarterly business review for this initiative",
      priority: 85,
      contextMatch: 90,
    });
    
    insights.push({
      id: "next-actions",
      type: "tip",
      category: "general",
      title: "Recommended Next Actions",
      description: "Get AI recommendations on what to focus on next based on current status.",
      actionLabel: "Get recommendations",
      actionPrompt: "What are the most important next actions for this initiative?",
      priority: 75,
      contextMatch: 80,
    });
  }
  
  if (context.phase === "account" && accountId && !projectId) {
    insights.push({
      id: "account-overview",
      type: "recommendation",
      category: "general",
      title: "Account Overview",
      description: "Get a comprehensive summary of all initiatives and value realization.",
      actionLabel: "View overview",
      actionPrompt: "Give me a complete overview of this account including all initiatives and KPI status",
      priority: 90,
      contextMatch: 95,
    });
    
    insights.push({
      id: "account-health",
      type: "tip",
      category: "general",
      title: "Account Health Check",
      description: "Identify at-risk initiatives and areas needing attention.",
      actionLabel: "Check health",
      actionPrompt: "What are the health indicators for this account? Are there any at-risk initiatives?",
      priority: 80,
      contextMatch: 85,
    });
  }
  
  if (context.isSalesWorkspace && projectId) {
    insights.push({
      id: "handoff-prep",
      type: "action",
      category: "handoff",
      title: "Prepare Handoff",
      description: "Create a handoff bundle for delivery or CSM team.",
      actionLabel: "Create handoff",
      actionPrompt: "Help me create a handoff package for the delivery team",
      priority: 70,
      contextMatch: 75,
    });
  }
  
  if (context.isDeliveryWorkspace && projectId) {
    insights.push({
      id: "delivery-status",
      type: "recommendation",
      category: "general",
      title: "Delivery Status",
      description: "Review delivery progress and upcoming milestones.",
      actionLabel: "Check status",
      actionPrompt: "What's the current delivery status for this initiative?",
      priority: 85,
      contextMatch: 90,
    });
  }
  
  if (context.isOnboarding || context.phase === "global") {
    insights.push({
      id: "getting-started",
      type: "tip",
      category: "general",
      title: "Getting Started",
      description: "Learn how to navigate accounts and initiatives effectively.",
      actionLabel: "Show guide",
      actionPrompt: "Help me understand how to navigate this platform and get started",
      priority: 50,
      contextMatch: 60,
    });
    
    insights.push({
      id: "list-accounts",
      type: "action",
      category: "general",
      title: "View All Accounts",
      description: "See a list of all your accounts and their current status.",
      actionLabel: "List accounts",
      actionPrompt: "List all accounts and their current status",
      priority: 60,
      contextMatch: 70,
    });
  }
  
  return insights.sort((a, b) => b.priority - a.priority);
}

export function useProactiveInsights({
  accountId,
  projectId,
  enabled = true,
  maxInsights = 3,
}: UseProactiveInsightsOptions) {
  const [location] = useLocation();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [lastRoute, setLastRoute] = useState(location);
  
  useEffect(() => {
    if (location !== lastRoute) {
      setDismissedIds(new Set());
      setLastRoute(location);
    }
  }, [location, lastRoute]);
  
  const routeContext = useMemo(() => parseRouteContext(location), [location]);
  
  const allInsights = useMemo(() => {
    if (!enabled) return [];
    return generateContextualInsights(routeContext, accountId, projectId);
  }, [routeContext, accountId, projectId, enabled]);
  
  const visibleInsights = useMemo(() => {
    return allInsights
      .filter(insight => !dismissedIds.has(insight.id))
      .slice(0, maxInsights);
  }, [allInsights, dismissedIds, maxInsights]);
  
  const dismissInsight = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...Array.from(prev), id]));
  }, []);
  
  const dismissAll = useCallback(() => {
    setDismissedIds(new Set(allInsights.map(i => i.id)));
  }, [allInsights]);
  
  const resetDismissed = useCallback(() => {
    setDismissedIds(new Set());
  }, []);
  
  return {
    insights: visibleInsights,
    allInsights,
    dismissedCount: dismissedIds.size,
    routeContext,
    dismissInsight,
    dismissAll,
    resetDismissed,
  };
}

export type { RouteContext };
