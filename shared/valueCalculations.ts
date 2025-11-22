// Value Calculation Utilities for Korn Ferry Offerings
// Handles financial impact calculations based on KPI improvements

import { getCapabilityMetadata, type CapabilityMetadata } from './knowledge';

// Base calculation inputs common across offerings
export interface BaseCalculationInputs {
  // Financial parameters
  discountRate?: number; // Annual discount rate (default 0.08)
  horizonYears?: number; // Number of years to project (default 3)
  implementationCost?: number; // One-time implementation cost
  annualCost?: number; // Recurring annual cost
  realisationRate?: number; // Override default realisation rate (0-1)
}

// Offering-specific calculation inputs
export interface SuccessProfilesInputs extends BaseCalculationInputs {
  qohDelta: number; // Quality of Hire improvement (index points)
  hiresPerYear: number; // Annual number of hires
  avgMarginPerHire: number; // Average contribution margin per hire (£)
}

export interface AssessmentsInputs extends BaseCalculationInputs {
  validityImprovement: number; // Improvement in predictive validity
  annualHires: number; // Number of hires per year
  avgContribution: number; // Average contribution per hire (£)
  assessmentCostPerHire?: number; // Cost per assessment
}

export interface LeadershipDevInputs extends BaseCalculationInputs {
  kpiDelta: number; // Improvement in chosen business KPI (%, £, or other)
  teamsAffected: number; // Number of teams impacted
  unitValuePerKPIPoint: number; // Financial value per KPI improvement unit
}

export interface AIReadyLeaderInputs extends BaseCalculationInputs {
  timeSavedPerDecision: number; // Hours saved per decision
  decisionsPerYear: number; // Annual decision volume
  valuePerDecisionHour: number; // £ value per decision hour
}

export interface TransformationInputs extends BaseCalculationInputs {
  productivityGainPerFTE: number; // £ productivity gain per FTE
  ftesAffected: number; // Number of FTEs impacted
  labourCostPerFTE: number; // Average labour cost per FTE
}

export interface SalesServiceInputs extends BaseCalculationInputs {
  winRateDelta: number; // Percentage point change in win rate (e.g., 5 for +5pp)
  pipelineExposure: number; // Total pipeline value (£)
  avgDealMargin: number; // Average margin % on deals (0-1)
}

export interface TotalRewardsInputs extends BaseCalculationInputs {
  retentionImprovement: number; // Percentage point improvement in retention
  cohortSize: number; // Number of employees in target cohort
  avgReplacementCost: number; // Average cost to replace an employee (£)
  spendRebalanceValue?: number; // Additional value from rebalanced spend (£)
}

export interface AnalyticsInputs extends BaseCalculationInputs {
  turnoverReduction: number; // Percentage point reduction in turnover
  employeesInScope: number; // Number of employees covered
  replacementCost: number; // Average replacement cost per employee (£)
}

// Result structure with detailed breakdown
export interface ValueCalculationResult {
  capability: string;
  solutionArea: string;
  
  // Core financial outputs
  year1Value: number; // First year incremental value
  totalNPV: number; // Net present value over horizon
  totalUndiscounted: number; // Total undiscounted value
  paybackMonths: number; // Months to payback implementation cost
  
  // Supporting metrics
  realisationRate: number; // Applied realisation rate
  implementationCost: number;
  annualCost: number;
  horizonYears: number;
  
  // Year-by-year breakdown
  yearlyBreakdown: Array<{
    year: number;
    grossValue: number; // Value before costs
    costs: number; // Costs in that year
    netValue: number; // Net value after costs
    discountedValue: number; // NPV for that year
    cumulativeNPV: number; // Running NPV total
  }>;
  
  // Metadata
  translationFormula: string;
  assumptions: Record<string, number | string>;
}

// Calculate NPV helper
function calculateNPV(
  annualValues: number[],
  discountRate: number,
  initialCost: number = 0
): number {
  let npv = -initialCost;
  annualValues.forEach((value, index) => {
    const year = index + 1;
    npv += value / Math.pow(1 + discountRate, year);
  });
  return npv;
}

// Calculate payback period in months
function calculatePayback(
  initialCost: number,
  annualNetValue: number
): number {
  if (annualNetValue <= 0) return Infinity;
  const years = initialCost / annualNetValue;
  return Math.round(years * 12);
}

// Success Profiles calculation
export function calculateSuccessProfilesValue(
  inputs: SuccessProfilesInputs
): ValueCalculationResult {
  const capability = getCapabilityMetadata("Success Profiles & Role Design");
  if (!capability) throw new Error("Capability not found");
  
  const realisationRate = inputs.realisationRate ?? capability.defaultRealisationRate;
  const discountRate = inputs.discountRate ?? 0.08;
  const horizonYears = inputs.horizonYears ?? 3;
  const implementationCost = inputs.implementationCost ?? 0;
  const annualCost = inputs.annualCost ?? 0;
  
  // Formula: QoH_delta × Hires_per_year × Avg_margin_per_role × Realisation_rate
  const annualGrossValue = 
    inputs.qohDelta * 
    inputs.hiresPerYear * 
    inputs.avgMarginPerHire * 
    realisationRate;
  
  const yearlyBreakdown = [];
  let cumulativeNPV = -implementationCost;
  
  for (let year = 1; year <= horizonYears; year++) {
    const costs = year === 1 ? annualCost : annualCost;
    const netValue = annualGrossValue - costs;
    const discountedValue = netValue / Math.pow(1 + discountRate, year);
    cumulativeNPV += discountedValue;
    
    yearlyBreakdown.push({
      year,
      grossValue: annualGrossValue,
      costs,
      netValue,
      discountedValue,
      cumulativeNPV
    });
  }
  
  return {
    capability: capability.name,
    solutionArea: "ASSESS",
    year1Value: annualGrossValue,
    totalNPV: cumulativeNPV,
    totalUndiscounted: annualGrossValue * horizonYears - annualCost * horizonYears,
    paybackMonths: calculatePayback(implementationCost, annualGrossValue - annualCost),
    realisationRate,
    implementationCost,
    annualCost,
    horizonYears,
    yearlyBreakdown,
    translationFormula: capability.translationFormula,
    assumptions: {
      qohDelta: inputs.qohDelta,
      hiresPerYear: inputs.hiresPerYear,
      avgMarginPerHire: inputs.avgMarginPerHire,
      realisationRate
    }
  };
}

// Sales & Service calculation
export function calculateSalesServiceValue(
  inputs: SalesServiceInputs
): ValueCalculationResult {
  const capability = getCapabilityMetadata("Sales & Service (KF Sell)");
  if (!capability) throw new Error("Capability not found");
  
  const realisationRate = inputs.realisationRate ?? capability.defaultRealisationRate;
  const discountRate = inputs.discountRate ?? 0.08;
  const horizonYears = inputs.horizonYears ?? 3;
  const implementationCost = inputs.implementationCost ?? 0;
  const annualCost = inputs.annualCost ?? 0;
  
  // Formula: WinRate_delta × Pipeline_exposure × Avg_deal_margin × Realisation_rate
  const annualGrossValue = 
    (inputs.winRateDelta / 100) * // Convert percentage points to decimal
    inputs.pipelineExposure * 
    inputs.avgDealMargin * 
    realisationRate;
  
  const yearlyBreakdown = [];
  let cumulativeNPV = -implementationCost;
  
  for (let year = 1; year <= horizonYears; year++) {
    const costs = annualCost;
    const netValue = annualGrossValue - costs;
    const discountedValue = netValue / Math.pow(1 + discountRate, year);
    cumulativeNPV += discountedValue;
    
    yearlyBreakdown.push({
      year,
      grossValue: annualGrossValue,
      costs,
      netValue,
      discountedValue,
      cumulativeNPV
    });
  }
  
  return {
    capability: capability.name,
    solutionArea: "COMMERCIAL",
    year1Value: annualGrossValue,
    totalNPV: cumulativeNPV,
    totalUndiscounted: annualGrossValue * horizonYears - annualCost * horizonYears,
    paybackMonths: calculatePayback(implementationCost, annualGrossValue - annualCost),
    realisationRate,
    implementationCost,
    annualCost,
    horizonYears,
    yearlyBreakdown,
    translationFormula: capability.translationFormula,
    assumptions: {
      winRateDelta: inputs.winRateDelta,
      pipelineExposure: inputs.pipelineExposure,
      avgDealMargin: inputs.avgDealMargin,
      realisationRate
    }
  };
}

// Transformation calculation
export function calculateTransformationValue(
  inputs: TransformationInputs
): ValueCalculationResult {
  const capability = getCapabilityMetadata("Organisation Strategy & Transformation");
  if (!capability) throw new Error("Capability not found");
  
  const realisationRate = inputs.realisationRate ?? capability.defaultRealisationRate;
  const discountRate = inputs.discountRate ?? 0.08;
  const horizonYears = inputs.horizonYears ?? 3;
  const implementationCost = inputs.implementationCost ?? 0;
  const annualCost = inputs.annualCost ?? 0;
  
  // Formula: Productivity_gain_per_FTE × FTEs_affected × labour_cost_per_FTE − transformation_cost
  // Note: transformation_cost is one-time, already captured in implementationCost
  const annualGrossValue = 
    inputs.productivityGainPerFTE * 
    inputs.ftesAffected * 
    realisationRate;
  
  const yearlyBreakdown = [];
  let cumulativeNPV = -implementationCost;
  
  for (let year = 1; year <= horizonYears; year++) {
    const costs = annualCost;
    const netValue = annualGrossValue - costs;
    const discountedValue = netValue / Math.pow(1 + discountRate, year);
    cumulativeNPV += discountedValue;
    
    yearlyBreakdown.push({
      year,
      grossValue: annualGrossValue,
      costs,
      netValue,
      discountedValue,
      cumulativeNPV
    });
  }
  
  return {
    capability: capability.name,
    solutionArea: "TRANSFORM",
    year1Value: annualGrossValue,
    totalNPV: cumulativeNPV,
    totalUndiscounted: annualGrossValue * horizonYears - annualCost * horizonYears,
    paybackMonths: calculatePayback(implementationCost, annualGrossValue - annualCost),
    realisationRate,
    implementationCost,
    annualCost,
    horizonYears,
    yearlyBreakdown,
    translationFormula: capability.translationFormula,
    assumptions: {
      productivityGainPerFTE: inputs.productivityGainPerFTE,
      ftesAffected: inputs.ftesAffected,
      labourCostPerFTE: inputs.labourCostPerFTE,
      realisationRate
    }
  };
}

// Total Rewards calculation
export function calculateTotalRewardsValue(
  inputs: TotalRewardsInputs
): ValueCalculationResult {
  const capability = getCapabilityMetadata("Total Rewards Optimisation (TRO)");
  if (!capability) throw new Error("Capability not found");
  
  const realisationRate = inputs.realisationRate ?? capability.defaultRealisationRate;
  const discountRate = inputs.discountRate ?? 0.08;
  const horizonYears = inputs.horizonYears ?? 3;
  const implementationCost = inputs.implementationCost ?? 0;
  const annualCost = inputs.annualCost ?? 0;
  
  // Formula: Retention_improvement × cohort_size × avg_replacement_cost + (value of rebalanced spend) − incremental_cost
  const retentionValue = 
    (inputs.retentionImprovement / 100) * // Convert to decimal
    inputs.cohortSize * 
    inputs.avgReplacementCost *
    realisationRate;
  
  const spendRebalance = (inputs.spendRebalanceValue ?? 0) * realisationRate;
  const annualGrossValue = retentionValue + spendRebalance;
  
  const yearlyBreakdown = [];
  let cumulativeNPV = -implementationCost;
  
  for (let year = 1; year <= horizonYears; year++) {
    const costs = annualCost;
    const netValue = annualGrossValue - costs;
    const discountedValue = netValue / Math.pow(1 + discountRate, year);
    cumulativeNPV += discountedValue;
    
    yearlyBreakdown.push({
      year,
      grossValue: annualGrossValue,
      costs,
      netValue,
      discountedValue,
      cumulativeNPV
    });
  }
  
  return {
    capability: capability.name,
    solutionArea: "REWARD",
    year1Value: annualGrossValue,
    totalNPV: cumulativeNPV,
    totalUndiscounted: annualGrossValue * horizonYears - annualCost * horizonYears,
    paybackMonths: calculatePayback(implementationCost, annualGrossValue - annualCost),
    realisationRate,
    implementationCost,
    annualCost,
    horizonYears,
    yearlyBreakdown,
    translationFormula: capability.translationFormula,
    assumptions: {
      retentionImprovement: inputs.retentionImprovement,
      cohortSize: inputs.cohortSize,
      avgReplacementCost: inputs.avgReplacementCost,
      spendRebalanceValue: inputs.spendRebalanceValue ?? 0,
      realisationRate
    }
  };
}

// Analytics / Turnover Reduction calculation
export function calculateAnalyticsValue(
  inputs: AnalyticsInputs
): ValueCalculationResult {
  const capability = getCapabilityMetadata("People Analytics / KFI Analytics");
  if (!capability) throw new Error("Capability not found");
  
  const realisationRate = inputs.realisationRate ?? capability.defaultRealisationRate;
  const discountRate = inputs.discountRate ?? 0.08;
  const horizonYears = inputs.horizonYears ?? 3;
  const implementationCost = inputs.implementationCost ?? 0;
  const annualCost = inputs.annualCost ?? 0;
  
  // Formula: Turnover_reduction × #employees × replacement_cost − analytics_cost
  const annualGrossValue = 
    (inputs.turnoverReduction / 100) * // Convert to decimal
    inputs.employeesInScope * 
    inputs.replacementCost * 
    realisationRate;
  
  const yearlyBreakdown = [];
  let cumulativeNPV = -implementationCost;
  
  for (let year = 1; year <= horizonYears; year++) {
    const costs = annualCost;
    const netValue = annualGrossValue - costs;
    const discountedValue = netValue / Math.pow(1 + discountRate, year);
    cumulativeNPV += discountedValue;
    
    yearlyBreakdown.push({
      year,
      grossValue: annualGrossValue,
      costs,
      netValue,
      discountedValue,
      cumulativeNPV
    });
  }
  
  return {
    capability: capability.name,
    solutionArea: "ANALYTICS",
    year1Value: annualGrossValue,
    totalNPV: cumulativeNPV,
    totalUndiscounted: annualGrossValue * horizonYears - annualCost * horizonYears,
    paybackMonths: calculatePayback(implementationCost, annualGrossValue - annualCost),
    realisationRate,
    implementationCost,
    annualCost,
    horizonYears,
    yearlyBreakdown,
    translationFormula: capability.translationFormula,
    assumptions: {
      turnoverReduction: inputs.turnoverReduction,
      employeesInScope: inputs.employeesInScope,
      replacementCost: inputs.replacementCost,
      realisationRate
    }
  };
}

// Leadership Development calculation
export function calculateLeadershipDevValue(
  inputs: LeadershipDevInputs
): ValueCalculationResult {
  const capability = getCapabilityMetadata("Leadership & Development Journeys");
  if (!capability) throw new Error("Capability not found");
  
  const realisationRate = inputs.realisationRate ?? capability.defaultRealisationRate;
  const discountRate = inputs.discountRate ?? 0.08;
  const horizonYears = inputs.horizonYears ?? 3;
  const implementationCost = inputs.implementationCost ?? 0;
  const annualCost = inputs.annualCost ?? 0;
  
  // Formula: KPI_delta × #_teams × unit_value_per_KPI_point × Realisation_rate
  const annualGrossValue = 
    inputs.kpiDelta * 
    inputs.teamsAffected * 
    inputs.unitValuePerKPIPoint * 
    realisationRate;
  
  const yearlyBreakdown = [];
  let cumulativeNPV = -implementationCost;
  
  for (let year = 1; year <= horizonYears; year++) {
    const costs = annualCost;
    const netValue = annualGrossValue - costs;
    const discountedValue = netValue / Math.pow(1 + discountRate, year);
    cumulativeNPV += discountedValue;
    
    yearlyBreakdown.push({
      year,
      grossValue: annualGrossValue,
      costs,
      netValue,
      discountedValue,
      cumulativeNPV
    });
  }
  
  return {
    capability: capability.name,
    solutionArea: "DEVELOP",
    year1Value: annualGrossValue,
    totalNPV: cumulativeNPV,
    totalUndiscounted: annualGrossValue * horizonYears - annualCost * horizonYears,
    paybackMonths: calculatePayback(implementationCost, annualGrossValue - annualCost),
    realisationRate,
    implementationCost,
    annualCost,
    horizonYears,
    yearlyBreakdown,
    translationFormula: capability.translationFormula,
    assumptions: {
      kpiDelta: inputs.kpiDelta,
      teamsAffected: inputs.teamsAffected,
      unitValuePerKPIPoint: inputs.unitValuePerKPIPoint,
      realisationRate
    }
  };
}

// Format currency helper
export function formatCurrency(value: number, currency: string = "£"): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1_000_000) {
    return `${sign}${currency}${(absValue / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `${sign}${currency}${(absValue / 1_000).toFixed(0)}k`;
  } else {
    return `${sign}${currency}${absValue.toFixed(0)}`;
  }
}
