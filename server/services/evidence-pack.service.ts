import { IStorage } from "../storage";
import type { EvidencePack } from "@shared/schema";

export interface AutoPopulateResult {
  success: boolean;
  itemsCreated: number;
  breakdown: {
    kpis: number;
    baselines: number;
    targets: number;
    insights: number;
    stakeholderClaims: number;
    artifacts: number;
    risks: number;
    decisions: number;
  };
  items: any[];
}

export interface AutoPopulateOptions {
  includeKpis?: boolean;
  includeInsights?: boolean;
  includeStakeholders?: boolean;
  includeArtifacts?: boolean;
  includeRisks?: boolean;
  includeDecisions?: boolean;
}

const DEFAULT_OPTIONS: AutoPopulateOptions = {
  includeKpis: true,
  includeInsights: true,
  includeStakeholders: true,
  includeArtifacts: true,
  includeRisks: true,
  includeDecisions: true,
};

// Evidence phase mapping based on item type
// Leading: Evidence that shows before revenue moves (discovery, success frame, stakeholder mapping)
// Mid-Loop: Evidence of behavior under pressure (assumption revisions, risk articulation, discipline)
// Lagging: Results with context (outcomes achieved, delivered value)
const EVIDENCE_PHASE_MAP: Record<string, "leading" | "mid_loop" | "lagging"> = {
  // Leading evidence
  "insight": "leading",
  "meeting_insight": "leading",
  "stakeholder_claim": "leading",
  "stakeholder_trust_signal": "leading",
  "success_frame": "leading",
  "engagement_indicator": "leading",
  "claim": "leading",
  "assumption": "leading",
  
  // Mid-loop evidence  
  "behavior_condition": "mid_loop",
  "behavior_signal": "mid_loop",
  "lever_applied": "mid_loop",
  "risk": "mid_loop",
  "risk_articulation": "mid_loop",
  "assumption_revision": "mid_loop",
  "decision": "mid_loop",
  "coaching_observation": "mid_loop",
  "communication_signal": "mid_loop",
  "leadership_behavior": "mid_loop",
  "commitment": "mid_loop",
  "next_action": "mid_loop",
  
  // Lagging evidence
  "kpi": "lagging",
  "baseline": "lagging",
  "target": "lagging",
  "outcome": "lagging",
  "outcome_signal": "lagging",
  "proof_object": "lagging",
  "success_story": "lagging",
  "benchmark": "lagging",
  "testimonial": "lagging",
  "deliverable": "lagging",
  "artifact": "lagging",
  "skill_growth_metric": "lagging",
  "relationship_milestone": "lagging",
  "handoff_quality": "lagging",
  "reusability_pattern": "lagging",
  "trust_milestone": "lagging",
};

function getEvidencePhase(itemType: string): "leading" | "mid_loop" | "lagging" {
  return EVIDENCE_PHASE_MAP[itemType] || "leading";
}

export class EvidencePackService {
  constructor(private storage: IStorage) {}

  async autoPopulate(
    packId: number,
    options: AutoPopulateOptions = DEFAULT_OPTIONS
  ): Promise<AutoPopulateResult> {
    const pack = await this.storage.getEvidencePack(packId);
    if (!pack) {
      throw new Error("Evidence pack not found");
    }

    const project = await this.storage.getProject(pack.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const createdItems: any[] = [];
    const existingItems = await this.storage.getEvidencePackItems(packId);
    const existingSourceIds = new Set(
      existingItems
        .filter((i) => i.sourceId)
        .map((i) => `${i.sourceType}-${i.sourceId}-${i.itemType}`)
    );

    if (options.includeKpis !== false) {
      const kpiItems = await this.importKpiCommitments(pack, existingSourceIds, createdItems.length);
      createdItems.push(...kpiItems);
    }

    if (options.includeInsights !== false) {
      const insightItems = await this.importDiscoveryInsights(pack, existingSourceIds, createdItems.length);
      createdItems.push(...insightItems);
    }

    if (options.includeStakeholders !== false) {
      const stakeholderItems = await this.importBluesheetStakeholders(pack, existingSourceIds, createdItems.length);
      createdItems.push(...stakeholderItems);
    }

    if (options.includeArtifacts !== false) {
      const artifactItems = await this.importArtifacts(pack, existingSourceIds, createdItems.length);
      createdItems.push(...artifactItems);
    }

    if (options.includeRisks !== false || options.includeDecisions !== false) {
      const bluesheetItems = await this.importBluesheetRisksAndDecisions(
        pack, 
        existingSourceIds, 
        createdItems.length,
        options.includeRisks !== false,
        options.includeDecisions !== false
      );
      createdItems.push(...bluesheetItems);
    }

    console.log(`[Evidence Pack Auto-Populate] Created ${createdItems.length} items for pack ${packId}`);

    return {
      success: true,
      itemsCreated: createdItems.length,
      breakdown: {
        kpis: createdItems.filter((i) => i.itemType === "kpi").length,
        baselines: createdItems.filter((i) => i.itemType === "baseline").length,
        targets: createdItems.filter((i) => i.itemType === "target").length,
        insights: createdItems.filter((i) => i.itemType === "meeting_insight").length,
        stakeholderClaims: createdItems.filter((i) => i.itemType === "stakeholder_claim").length,
        artifacts: createdItems.filter((i) => i.itemType === "artifact").length,
        risks: createdItems.filter((i) => i.itemType === "risk").length,
        decisions: createdItems.filter((i) => i.itemType === "decision").length,
      },
      items: createdItems,
    };
  }

  private async importKpiCommitments(
    pack: EvidencePack,
    existingSourceIds: Set<string>,
    startOrder: number
  ): Promise<any[]> {
    const createdItems: any[] = [];
    const commitments = await this.storage.getKpiCommitments(pack.projectId);

    for (const c of commitments) {
      const commitment = c as any;
      const kpiKey = `kpi_commitment-${c.id}-kpi`;
      const baselineKey = `kpi_commitment-${c.id}-baseline`;
      const targetKey = `kpi_commitment-${c.id}-target`;

      if (!existingSourceIds.has(kpiKey)) {
        const kpiItem = await this.storage.createEvidencePackItem({
          packId: pack.id,
          itemType: "kpi" as any,
          evidencePhase: getEvidencePhase("kpi") as any,
          claim: `${c.commitmentTitle}: ${commitment.kpiName || "Key metric tracking"} with target of ${commitment.targetValue || "TBD"} ${commitment.unit || ""}`,
          sourceType: "kpi_commitment",
          sourceId: c.id,
          sourceKind: "system_event" as any,
          sourceEventId: `commitment-${c.id}`,
          confidenceLevel: "high" as any,
          itemStatus: "draft" as any,
          valuePillar: (commitment.valuePillar as any) || null,
          audienceScope: "both" as any,
          evidenceSensitivity: "client_shareable" as any,
          skillDomain: "hard_data" as any,
          skillCategory: "metrics",
          content: {
            metricName: commitment.kpiName || undefined,
            baselineValue: commitment.baselineValue || undefined,
            targetValue: commitment.targetValue || undefined,
            unit: commitment.unit || undefined,
            kfOffering: commitment.kornFerrySolution || commitment.kfOffering || undefined,
            whatThisProves: `Committed outcome with measurable target of ${commitment.targetValue || "TBD"} ${commitment.unit || ""}`,
          },
          links: {
            projectId: pack.projectId,
            accountId: pack.accountId || undefined,
            commitmentIds: [c.id],
            kfOffering: commitment.kornFerrySolution || commitment.kfOffering || undefined,
          },
          displayOrder: startOrder + createdItems.length,
          section: "Results with Context",
        } as any);
        createdItems.push(kpiItem);
        existingSourceIds.add(kpiKey);
      }

      if (commitment.baselineValue && !existingSourceIds.has(baselineKey)) {
        const baselineItem = await this.storage.createEvidencePackItem({
          packId: pack.id,
          itemType: "baseline" as any,
          evidencePhase: getEvidencePhase("baseline") as any,
          claim: `Current baseline for ${commitment.kpiName || c.commitmentTitle}: ${commitment.baselineValue} ${commitment.unit || ""}`,
          sourceType: "kpi_commitment",
          sourceId: c.id,
          sourceKind: "system_event" as any,
          sourceEventId: `commitment-baseline-${c.id}`,
          confidenceLevel: "medium" as any,
          itemStatus: "draft" as any,
          valuePillar: (commitment.valuePillar as any) || null,
          audienceScope: "both" as any,
          evidenceSensitivity: "client_shareable" as any,
          skillDomain: "hard_data" as any,
          skillCategory: "baseline",
          content: {
            metricName: commitment.kpiName || undefined,
            baselineValue: commitment.baselineValue,
            unit: commitment.unit || undefined,
            whatThisProves: `Starting point measurement before engagement`,
          },
          links: {
            projectId: pack.projectId,
            commitmentIds: [c.id],
          },
          displayOrder: startOrder + createdItems.length,
          section: "Results with Context",
        } as any);
        createdItems.push(baselineItem);
        existingSourceIds.add(baselineKey);
      }

      if (commitment.targetValue && !existingSourceIds.has(targetKey)) {
        const targetItem = await this.storage.createEvidencePackItem({
          packId: pack.id,
          itemType: "target" as any,
          evidencePhase: getEvidencePhase("target") as any,
          claim: `Target for ${commitment.kpiName || c.commitmentTitle}: ${commitment.targetValue} ${commitment.unit || ""}`,
          sourceType: "kpi_commitment",
          sourceId: c.id,
          sourceKind: "system_event" as any,
          sourceEventId: `commitment-target-${c.id}`,
          confidenceLevel: "high" as any,
          itemStatus: "draft" as any,
          valuePillar: (commitment.valuePillar as any) || null,
          audienceScope: "both" as any,
          evidenceSensitivity: "client_shareable" as any,
          skillDomain: "hard_data" as any,
          skillCategory: "target",
          content: {
            metricName: commitment.kpiName || undefined,
            targetValue: commitment.targetValue,
            unit: commitment.unit || undefined,
            whatThisProves: `Agreed target representing success criteria`,
          },
          links: {
            projectId: pack.projectId,
            commitmentIds: [c.id],
          },
          displayOrder: startOrder + createdItems.length,
          section: "Results with Context",
        } as any);
        createdItems.push(targetItem);
        existingSourceIds.add(targetKey);
      }
    }

    return createdItems;
  }

  private async importDiscoveryInsights(
    pack: EvidencePack,
    existingSourceIds: Set<string>,
    startOrder: number
  ): Promise<any[]> {
    const createdItems: any[] = [];
    const dataPoints = await this.storage.getCompanyDataPoints(pack.projectId);

    for (const dp of dataPoints) {
      const sourceKey = `discovery_insight-${dp.id}-meeting_insight`;
      if (existingSourceIds.has(sourceKey)) continue;

      const insightItem = await this.storage.createEvidencePackItem({
        packId: pack.id,
        itemType: "meeting_insight" as any,
        evidencePhase: getEvidencePhase("meeting_insight") as any,
        claim: `${dp.label}: ${dp.value}`,
        sourceType: "discovery_insight",
        sourceId: dp.id,
        sourceKind: "human" as any,
        sourceEventId: `insight-${dp.id}`,
        confidenceLevel: dp.confidence === "high" ? "high" : dp.confidence === "low" ? "exploratory" : "medium",
        itemStatus: "draft" as any,
        valuePillar: null,
        audienceScope: "both" as any,
        evidenceSensitivity: "client_shareable" as any,
        skillDomain: "soft_skill" as any,
        skillCategory: "discovery",
        content: {
          whatThisProves: `Discovery insight captured during qualification`,
        },
        links: {
          projectId: pack.projectId,
          insightIds: [dp.id],
        },
        displayOrder: startOrder + createdItems.length,
        section: "What We Saw Before Results",
      } as any);
      createdItems.push(insightItem);
      existingSourceIds.add(sourceKey);
    }

    return createdItems;
  }

  private async importBluesheetStakeholders(
    pack: EvidencePack,
    existingSourceIds: Set<string>,
    startOrder: number
  ): Promise<any[]> {
    const createdItems: any[] = [];
    const bluesheet = await this.storage.getBlueSheet(pack.projectId);

    const bluesheetData = bluesheet?.data as any;
    if (bluesheetData?.buyingInfluences) {
      const influences = bluesheetData.buyingInfluences as any[];
      for (let i = 0; i < influences.length; i++) {
        const influence = influences[i];
        if (!influence.personalWins && !influence.businessResults) continue;

        const stakeholderIdStr = influence.id ? String(influence.id) : `bluesheet-${bluesheet!.id}-${i}`;
        const stakeholderKey = `manual-${stakeholderIdStr}-stakeholder_claim`;
        if (existingSourceIds.has(stakeholderKey)) continue;

        // Create customer-facing stakeholder claim
        const stakeholderItem = await this.storage.createEvidencePackItem({
          packId: pack.id,
          itemType: "stakeholder_claim" as any,
          evidencePhase: getEvidencePhase("stakeholder_claim") as any,
          claim: influence.personalWins || influence.businessResults || `${influence.name} - ${influence.role}`,
          sourceType: "manual",
          sourceId: typeof influence.id === 'number' ? influence.id : null,
          sourceKind: "human" as any,
          sourceEventId: `stakeholder-${stakeholderIdStr}`,
          confidenceLevel: "medium" as any,
          itemStatus: "needs_stakeholder_validation" as any,
          valuePillar: null,
          audienceScope: "customer" as any,
          evidenceSensitivity: "client_shareable" as any,
          skillDomain: "relationship" as any,
          skillCategory: "stakeholder_trust" as any,
          content: {
            stakeholderName: influence.name,
            stakeholderRole: influence.role,
            whatThisProves: `Stakeholder alignment and personal wins identified`,
          },
          links: {
            projectId: pack.projectId,
            bluesheetId: bluesheet!.id,
            stakeholderIds: influence.id ? [influence.id] : undefined,
          },
          displayOrder: startOrder + createdItems.length,
          section: "What We Saw Before Results",
        } as any);
        createdItems.push(stakeholderItem);
        existingSourceIds.add(stakeholderKey);
        
        // Create internal trust signal for relationship tracking
        const trustKey = `manual-${stakeholderIdStr}-stakeholder_trust_signal`;
        if (!existingSourceIds.has(trustKey)) {
          const trustItem = await this.storage.createEvidencePackItem({
            packId: pack.id,
            itemType: "stakeholder_trust_signal" as any,
            evidencePhase: getEvidencePhase("stakeholder_trust_signal") as any,
            claim: `Trust indicator for ${influence.name}: ${influence.rating || 'Unknown'} rating, ${influence.degree || 'Unknown'} degree of influence`,
            sourceType: "manual",
            sourceId: typeof influence.id === 'number' ? influence.id : null,
            sourceKind: "human" as any,
            sourceEventId: `trust-${stakeholderIdStr}`,
            confidenceLevel: influence.rating === 5 ? "high" : influence.rating >= 3 ? "medium" : "exploratory",
            itemStatus: "draft" as any,
            valuePillar: null,
            audienceScope: "internal" as any,
            evidenceSensitivity: "internal_only" as any,
            skillDomain: "relationship" as any,
            skillCategory: "stakeholder_trust" as any,
            metricType: "quantitative" as any,
            metricValue: influence.rating ? String(influence.rating) : null,
            metricUnit: "rating (1-5)",
            content: {
              stakeholderName: influence.name,
              stakeholderRole: influence.role,
              whatThisProves: `Trust velocity indicator showing relationship quality`,
            },
            links: {
              projectId: pack.projectId,
              bluesheetId: bluesheet!.id,
              stakeholderIds: influence.id ? [influence.id] : undefined,
            },
            displayOrder: startOrder + createdItems.length,
            section: "What We Saw Before Results",
          } as any);
          createdItems.push(trustItem);
          existingSourceIds.add(trustKey);
        }
        
        console.log(`[Evidence Pack] Created stakeholder + trust items for ${influence.name || 'unknown'}`)
      }
    }

    return createdItems;
  }

  private async importArtifacts(
    pack: EvidencePack,
    existingSourceIds: Set<string>,
    startOrder: number
  ): Promise<any[]> {
    const createdItems: any[] = [];
    const artifacts = await this.storage.getInteractionArtifacts(pack.projectId);

    for (const artifact of artifacts) {
      const sourceKey = `evidence_artefact-${artifact.id}-artifact`;
      if (existingSourceIds.has(sourceKey)) continue;

      const art = artifact as any;
      const artifactItem = await this.storage.createEvidencePackItem({
        packId: pack.id,
        itemType: "artifact" as any,
        evidencePhase: getEvidencePhase("artifact") as any,
        claim: `${art.title || art.fileName || 'Document'}: ${art.description || art.extractedContent?.substring(0, 100) || 'Uploaded artifact'}`,
        sourceType: "evidence_artefact",
        sourceId: artifact.id,
        sourceKind: "human" as any,
        sourceArtifactId: artifact.id.toString(),
        confidenceLevel: "high" as any,
        itemStatus: "draft" as any,
        valuePillar: null,
        audienceScope: "both" as any,
        evidenceSensitivity: "client_shareable" as any,
        skillDomain: "hard_data" as any,
        skillCategory: "documentation",
        content: {
          whatThisProves: `Documented proof supporting value claims`,
        },
        links: {
          projectId: pack.projectId,
        },
        displayOrder: startOrder + createdItems.length,
        section: "Results with Context",
      } as any);
      createdItems.push(artifactItem);
      existingSourceIds.add(sourceKey);
    }

    return createdItems;
  }

  private async importBluesheetRisksAndDecisions(
    pack: EvidencePack,
    existingSourceIds: Set<string>,
    startOrder: number,
    includeRisks: boolean,
    includeDecisions: boolean
  ): Promise<any[]> {
    const createdItems: any[] = [];
    const bluesheet = await this.storage.getBlueSheet(pack.projectId);

    if (!bluesheet) return createdItems;
    
    const bluesheetData = bluesheet.data as any;

    if (includeRisks && bluesheetData?.redFlags) {
      const redFlags = bluesheetData.redFlags as any[];
      for (let i = 0; i < redFlags.length; i++) {
        const flag = redFlags[i];
        if (!flag.description) continue;

        const riskId = flag.id || `${bluesheet.id}-risk-${i}`;
        const riskKey = `manual-${riskId}-risk`;
        if (existingSourceIds.has(riskKey)) continue;

        const riskItem = await this.storage.createEvidencePackItem({
          packId: pack.id,
          itemType: "risk" as any,
          evidencePhase: getEvidencePhase("risk") as any,
          claim: flag.description,
          sourceType: "manual",
          sourceId: riskId as any,
          sourceKind: "human" as any,
          sourceEventId: `redflag-${riskId}`,
          confidenceLevel: flag.severity === "high" ? "high" : "medium",
          itemStatus: flag.mitigationPlan ? "draft" : "needs_input",
          valuePillar: "derisk" as any,
          audienceScope: "internal" as any,
          evidenceSensitivity: "internal_only" as any,
          skillDomain: "soft_skill" as any,
          skillCategory: "risk_management",
          content: {
            riskDescription: flag.description,
            severity: flag.severity,
            mitigationPlan: flag.mitigationPlan,
            whatThisProves: `Risk identified and articulated - shows deal discipline`,
          },
          links: {
            projectId: pack.projectId,
            bluesheetId: bluesheet.id,
          },
          displayOrder: startOrder + createdItems.length,
          section: "How Discipline Held Under Pressure",
        } as any);
        createdItems.push(riskItem);
        existingSourceIds.add(riskKey);
      }
    }

    if (includeDecisions && bluesheetData?.idealCustomerProfile) {
      const icp = bluesheetData.idealCustomerProfile as any;
      if (icp.decisionProcess) {
        const decisionKey = `manual-${bluesheet.id}-decision_process`;
        if (!existingSourceIds.has(decisionKey)) {
          const decisionItem = await this.storage.createEvidencePackItem({
            packId: pack.id,
            itemType: "decision" as any,
            evidencePhase: getEvidencePhase("decision") as any,
            claim: `Decision Process: ${icp.decisionProcess}`,
            sourceType: "manual",
            sourceId: bluesheet.id,
            sourceKind: "human" as any,
            confidenceLevel: "medium" as any,
            itemStatus: "draft" as any,
            valuePillar: null,
            audienceScope: "internal" as any,
            evidenceSensitivity: "internal_only" as any,
            skillDomain: "soft_skill" as any,
            skillCategory: "sales_process",
            content: {
              whatThisProves: `Decision process mapped and understood`,
            },
            links: {
              projectId: pack.projectId,
              bluesheetId: bluesheet.id,
            },
            displayOrder: startOrder + createdItems.length,
            section: "How Discipline Held Under Pressure",
          } as any);
          createdItems.push(decisionItem);
          existingSourceIds.add(decisionKey);
        }
      }
    }

    return createdItems;
  }
}
