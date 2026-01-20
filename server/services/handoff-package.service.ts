import OpenAI from "openai";
import { IStorage } from "../storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface HandoffPackage {
  executiveSummary: string;
  whyTheyBought: string[];
  successCriteria: string[];
  keyStakeholders: Array<{
    name: string;
    role: string;
    influence: string;
    notes: string;
  }>;
  risksAndConcerns: string[];
  specialCommitments: string[];
  recommendedActions: string[];
  generatedAt: string;
}

export interface HandoffPackageGenerationResult {
  success: boolean;
  package: HandoffPackage | null;
  error?: string;
}

export class HandoffPackageService {
  constructor(private storage: IStorage) {}

  async generateHandoffPackage(projectId: number): Promise<HandoffPackageGenerationResult> {
    try {
      const project = await this.storage.getProject(projectId);
      if (!project) {
        return { success: false, package: null, error: "Project not found" };
      }

      const [
        commitments,
        discoveryNotes,
        bluesheet,
        evidencePack,
        dataPoints,
      ] = await Promise.all([
        this.storage.getKpiCommitments(projectId),
        this.storage.getDiscoveryNotes(projectId),
        this.storage.getBluesheet(projectId),
        this.storage.getEvidencePack(projectId),
        this.storage.getCompanyDataPoints(projectId),
      ]);

      const confirmedCommitments = commitments.filter(
        (c: any) => c.status === "confirmed" || c.status === "client_confirmed"
      );

      const context = {
        companyName: project.companyName,
        projectName: project.name,
        sector: project.sector,
        businessUnit: project.businessUnit,
        confirmedOutcomes: confirmedCommitments.map((c: any) => ({
          name: c.commitmentTitle || c.name,
          baselineValue: c.baselineValue,
          targetValue: c.targetValue,
          kpiUnit: c.kpiUnit,
          estimatedValue: c.estimatedAnnualValue,
          valuePillar: c.valuePillar,
          successCriteria: c.successCriteria,
          measurementMethod: c.measurementMethod,
        })),
        keyInsights: dataPoints.slice(0, 10).map((dp: any) => ({
          headline: dp.label || dp.value,
          category: dp.category,
          source: dp.source,
        })),
        discoveryContext: {
          keyStakeholder: discoveryNotes?.keyStakeholder,
          topChallenges: discoveryNotes?.topChallenges,
          timeline: discoveryNotes?.timeline,
          freeformNotes: discoveryNotes?.freeformNotes,
        },
        bluesheetData: bluesheet ? {
          salesObjective: (bluesheet as any).data?.singleSalesObjective,
          buyingInfluences: (bluesheet as any).data?.buyingInfluences,
          redFlags: (bluesheet as any).data?.redFlags,
          strengthsOfPosition: (bluesheet as any).data?.strengthsOfPosition,
        } : null,
        evidenceCount: evidencePack?.items?.length || 0,
        handoffNotes: project.handoffNotes,
      };

      const prompt = `You are an expert Customer Success Manager preparing a handoff brief for a delivery team. 
      
Based on the following sales engagement data, generate a comprehensive handoff package that will enable the delivery team to hit the ground running.

ENGAGEMENT DATA:
${JSON.stringify(context, null, 2)}

Generate a JSON response with exactly this structure:
{
  "executiveSummary": "2-3 sentence executive summary of the engagement and its strategic importance",
  "whyTheyBought": ["Array of 3-5 key reasons why this customer chose to partner with us"],
  "successCriteria": ["Array of 3-5 specific, measurable success criteria from the customer's perspective"],
  "keyStakeholders": [
    {
      "name": "Stakeholder name",
      "role": "Their title/role",
      "influence": "high/medium/low",
      "notes": "Key notes about working with this person"
    }
  ],
  "risksAndConcerns": ["Array of 3-5 risks or concerns the delivery team should be aware of"],
  "specialCommitments": ["Array of any special commitments or promises made during sales"],
  "recommendedActions": ["Array of 3-5 recommended first actions for the delivery team"]
}

Focus on actionable, specific information that helps the delivery team understand:
1. What success looks like from the customer's perspective
2. Who the key players are and how to work with them
3. What risks to watch for
4. What to do first

Return only valid JSON, no markdown.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, package: null, error: "No response from AI" };
      }

      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      const packageData = JSON.parse(cleanedContent) as Omit<HandoffPackage, "generatedAt">;

      const handoffPackage: HandoffPackage = {
        ...packageData,
        generatedAt: new Date().toISOString(),
      };

      await this.storage.updateProject(projectId, {
        handoffPackage: handoffPackage as any,
      });

      return { success: true, package: handoffPackage };
    } catch (error: any) {
      console.error("[HandoffPackageService] Error generating package:", error);
      return { success: false, package: null, error: error.message };
    }
  }

  async getHandoffPackage(projectId: number): Promise<HandoffPackage | null> {
    const project = await this.storage.getProject(projectId);
    if (!project || !project.handoffPackage) {
      return null;
    }
    return project.handoffPackage as HandoffPackage;
  }

  async calculateDeliveryReadiness(projectId: number): Promise<{
    score: number;
    checks: Array<{ label: string; passed: boolean; weight: number }>;
  }> {
    const [project, commitments, discoveryNotes, dataPoints] = await Promise.all([
      this.storage.getProject(projectId),
      this.storage.getKpiCommitments(projectId),
      this.storage.getDiscoveryNotes(projectId),
      this.storage.getCompanyDataPoints(projectId),
    ]);

    const confirmedCommitments = commitments.filter(
      (c: any) => c.status === "confirmed" || c.status === "client_confirmed"
    );

    const hasDiscoveryContent = dataPoints.length > 0 || !!discoveryNotes || !!(project as any)?.discoveryCompleted;

    const checks = [
      { 
        label: "Confirmed outcomes defined", 
        passed: confirmedCommitments.length > 0, 
        weight: 25 
      },
      { 
        label: "Value metrics established", 
        passed: confirmedCommitments.some((c: any) => c.targetValue), 
        weight: 20 
      },
      { 
        label: "Stakeholder identified", 
        passed: !!(discoveryNotes?.keyStakeholder || project?.clientLead), 
        weight: 20 
      },
      { 
        label: "Discovery completed", 
        passed: hasDiscoveryContent, 
        weight: 15 
      },
      { 
        label: "Baseline measurements captured", 
        passed: confirmedCommitments.some((c: any) => c.baselineValue), 
        weight: 10 
      },
      { 
        label: "Handoff notes prepared", 
        passed: !!project?.handoffNotes, 
        weight: 10 
      },
    ];

    const score = checks.reduce((sum, check) => 
      sum + (check.passed ? check.weight : 0), 0
    );

    return { score, checks };
  }

  async initializeSuccessPlan(projectId: number): Promise<any> {
    const [project, commitments] = await Promise.all([
      this.storage.getProject(projectId),
      this.storage.getKpiCommitments(projectId),
    ]);

    if (!project) {
      throw new Error("Project not found");
    }

    const confirmedCommitments = commitments.filter(
      (c: any) => c.status === "confirmed" || c.status === "client_confirmed"
    );

    const desiredOutcomes = confirmedCommitments.map((c: any) => ({
      id: `outcome-${c.id}`,
      outcome: c.name,
      businessImpact: c.strategicRationale || `Improve ${c.name} from ${c.baselineValue} to ${c.targetValue}`,
      successMetric: `${c.name}: ${c.baselineValue || "baseline"} → ${c.targetValue || "target"} ${c.kpiUnit || ""}`,
      targetDate: c.targetDate ? new Date(c.targetDate).toISOString() : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: "not_started" as const,
      linkedKPIIds: [c.id],
    }));

    const successPlan = await this.storage.createSuccessPlan({
      projectId,
      title: `${project.companyName} Success Plan`,
      status: "draft",
      desiredOutcomes,
      customerResponsibilities: [
        "Provide timely access to data and stakeholders",
        "Participate in regular check-in meetings",
        "Communicate changes in priorities or scope",
      ],
      vendorResponsibilities: [
        "Deliver on agreed outcomes within timeline",
        "Provide regular progress updates",
        "Escalate risks proactively",
      ],
      executiveSponsor: project.clientLead || null,
      deliveryLead: project.initiativeOwner || null,
      reviewCadence: "monthly",
      overallProgress: 0,
      riskLevel: "low",
    });

    return successPlan;
  }
}
