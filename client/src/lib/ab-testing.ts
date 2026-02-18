/**
 * A/B testing framework with variant assignment and statistical significance.
 * Stores variant assignments in localStorage for consistency across sessions.
 */

export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[];
}

export interface VariantAssignment {
  experimentId: string;
  variant: string;
  assignedAt: number;
}

export interface ExperimentResult {
  experimentId: string;
  variant: string;
  conversions: number;
  impressions: number;
  conversionRate: number;
}

const ASSIGNMENTS_KEY = 'sas_ab_assignments';
const RESULTS_KEY = 'sas_ab_results';

function getAssignments(): Record<string, VariantAssignment> {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAssignments(assignments: Record<string, VariantAssignment>): void {
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch {
    // Storage unavailable
  }
}

function getResults(): Record<string, Record<string, { conversions: number; impressions: number }>> {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveResults(results: Record<string, Record<string, { conversions: number; impressions: number }>>): void {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch {
    // Storage unavailable
  }
}

/**
 * Assign a user to a variant for an experiment.
 * Uses weighted random selection, persists across sessions.
 */
export function assignVariant(experiment: Experiment): string {
  const assignments = getAssignments();

  if (assignments[experiment.id]) {
    return assignments[experiment.id].variant;
  }

  const { variants, weights } = experiment;
  let variant: string;

  if (weights && weights.length === variants.length) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        idx = i;
        break;
      }
    }
    variant = variants[idx];
  } else {
    variant = variants[Math.floor(Math.random() * variants.length)];
  }

  assignments[experiment.id] = {
    experimentId: experiment.id,
    variant,
    assignedAt: Date.now(),
  };
  saveAssignments(assignments);

  return variant;
}

/**
 * Get the current variant for an experiment (returns null if not assigned).
 */
export function getVariant(experimentId: string): string | null {
  const assignments = getAssignments();
  return assignments[experimentId]?.variant ?? null;
}

/**
 * Record an impression for a variant.
 */
export function recordImpression(experimentId: string): void {
  const assignments = getAssignments();
  const variant = assignments[experimentId]?.variant;
  if (!variant) return;

  const results = getResults();
  if (!results[experimentId]) results[experimentId] = {};
  if (!results[experimentId][variant]) results[experimentId][variant] = { conversions: 0, impressions: 0 };
  results[experimentId][variant].impressions++;
  saveResults(results);
}

/**
 * Record a conversion for a variant.
 */
export function recordConversion(experimentId: string): void {
  const assignments = getAssignments();
  const variant = assignments[experimentId]?.variant;
  if (!variant) return;

  const results = getResults();
  if (!results[experimentId]) results[experimentId] = {};
  if (!results[experimentId][variant]) results[experimentId][variant] = { conversions: 0, impressions: 0 };
  results[experimentId][variant].conversions++;
  saveResults(results);
}

/**
 * Get experiment results for all variants.
 */
export function getExperimentResults(experimentId: string): ExperimentResult[] {
  const results = getResults();
  const expResults = results[experimentId] ?? {};

  return Object.entries(expResults).map(([variant, data]) => ({
    experimentId,
    variant,
    conversions: data.conversions,
    impressions: data.impressions,
    conversionRate: data.impressions > 0 ? data.conversions / data.impressions : 0,
  }));
}

/**
 * Calculate statistical significance using a z-test for two proportions.
 * Returns a p-value; significance is typically p < 0.05.
 */
export function calculateSignificance(
  controlConversions: number,
  controlImpressions: number,
  variantConversions: number,
  variantImpressions: number
): { zScore: number; pValue: number; isSignificant: boolean } {
  if (controlImpressions === 0 || variantImpressions === 0) {
    return { zScore: 0, pValue: 1, isSignificant: false };
  }

  const p1 = controlConversions / controlImpressions;
  const p2 = variantConversions / variantImpressions;
  const pPooled = (controlConversions + variantConversions) / (controlImpressions + variantImpressions);
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / controlImpressions + 1 / variantImpressions));

  if (se === 0) {
    return { zScore: 0, pValue: 1, isSignificant: false };
  }

  const zScore = (p1 - p2) / se;

  // Approximate two-tailed p-value using the error function approximation
  const absZ = Math.abs(zScore);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp(-absZ * absZ / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const pValue = 2 * prob;

  return {
    zScore: Math.round(zScore * 1000) / 1000,
    pValue: Math.round(pValue * 10000) / 10000,
    isSignificant: pValue < 0.05,
  };
}

/**
 * Clear all experiment assignments and results.
 */
export function clearExperiments(): void {
  localStorage.removeItem(ASSIGNMENTS_KEY);
  localStorage.removeItem(RESULTS_KEY);
}
