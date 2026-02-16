/**
 * Client-side insights engine for generating actionable recommendations
 * from shelter data trends, benchmarks, and seasonal patterns.
 */

export interface Insight {
  id: string;
  category: 'capacity' | 'applications' | 'intake' | 'length_of_stay' | 'adoption_rate' | 'seasonal' | 'benchmark';
  severity: 'info' | 'warning' | 'high' | 'critical';
  title: string;
  description: string;
  suggestedAction: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  periodLabel: string;
  isAnomaly: boolean;
}

export interface WhatIfResult {
  scenario: string;
  projectedOccupancy: number;
  daysUntilCapacity: number;
  recommendation: string;
}

export interface InsightFeedback {
  insightId: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
  timestamp: number;
}

const FEEDBACK_KEY = 'sas_insight_feedback';
const DISMISSED_KEY = 'sas_insights_dismissed';

/**
 * Analyze a numeric trend between two periods.
 */
export function analyzeTrend(
  current: number,
  previous: number,
  metric: string,
  periodLabel: string
): TrendAnalysis {
  if (previous === 0) {
    return {
      metric,
      direction: current > 0 ? 'increasing' : 'stable',
      changePercent: current > 0 ? 100 : 0,
      periodLabel,
      isAnomaly: current > 10,
    };
  }

  const changePercent = Math.round(((current - previous) / previous) * 100);
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (changePercent > 5) direction = 'increasing';
  if (changePercent < -5) direction = 'decreasing';

  // Anomaly if change is more than 50%
  const isAnomaly = Math.abs(changePercent) > 50;

  return { metric, direction, changePercent, periodLabel, isAnomaly };
}

/**
 * Generate a human-readable summary from a trend analysis.
 */
export function generateTrendNarrative(trend: TrendAnalysis): string {
  const absChange = Math.abs(trend.changePercent);

  if (trend.direction === 'stable') {
    return `${trend.metric} remained stable ${trend.periodLabel} with minimal change.`;
  }

  const verb = trend.direction === 'increasing' ? 'increased' : 'decreased';
  let qualifier = '';
  if (absChange > 50) qualifier = 'significantly ';
  else if (absChange > 20) qualifier = 'notably ';

  let narrative = `${trend.metric} ${qualifier}${verb} by ${absChange}% ${trend.periodLabel}.`;

  if (trend.isAnomaly) {
    narrative += ' This is an unusual change that warrants investigation.';
  }

  return narrative;
}

/**
 * Score adoption likelihood based on animal profile completeness.
 */
export function scoreAdoptionLikelihood(profile: {
  hasPhoto: boolean;
  hasDescription: boolean;
  descriptionLength: number;
  photoCount: number;
  hasVideo: boolean;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  houseTrained?: boolean;
  age: number;
  daysInShelter: number;
}): { score: number; factors: string[] } {
  let score = 50; // Base score
  const factors: string[] = [];

  if (profile.hasPhoto) {
    score += 10;
    factors.push('+10 has primary photo');
  } else {
    score -= 15;
    factors.push('-15 missing primary photo');
  }

  if (profile.photoCount >= 3) {
    score += 5;
    factors.push('+5 multiple photos');
  }

  if (profile.hasDescription && profile.descriptionLength > 100) {
    score += 10;
    factors.push('+10 detailed description');
  } else if (profile.hasDescription) {
    score += 5;
    factors.push('+5 has description');
  } else {
    score -= 10;
    factors.push('-10 missing description');
  }

  if (profile.hasVideo) {
    score += 5;
    factors.push('+5 has video');
  }

  // Compatibility info completeness
  if (profile.goodWithKids !== undefined) { score += 3; factors.push('+3 kids compatibility noted'); }
  if (profile.goodWithDogs !== undefined) { score += 3; factors.push('+3 dog compatibility noted'); }
  if (profile.goodWithCats !== undefined) { score += 3; factors.push('+3 cat compatibility noted'); }
  if (profile.houseTrained) { score += 5; factors.push('+5 house trained'); }

  // Age factor (younger animals tend to be adopted faster)
  if (profile.age <= 2) { score += 5; factors.push('+5 young animal'); }
  else if (profile.age >= 8) { score -= 5; factors.push('-5 senior animal'); }

  // Length of stay penalty
  if (profile.daysInShelter > 90) {
    score -= 10;
    factors.push('-10 long stay (90+ days)');
  } else if (profile.daysInShelter > 30) {
    score -= 5;
    factors.push('-5 moderate stay (30+ days)');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
  };
}

/**
 * Calculate what-if scenario for capacity planning.
 */
export function calculateWhatIf(
  currentOccupancy: number,
  maxCapacity: number,
  monthlyIntakeRate: number,
  monthlyOutcomeRate: number,
  intakeChangePercent: number,
  adoptionChangePercent: number
): WhatIfResult {
  const projectedIntake = monthlyIntakeRate * (1 + intakeChangePercent / 100);
  const projectedOutcome = monthlyOutcomeRate * (1 + adoptionChangePercent / 100);
  const netChange = projectedIntake - projectedOutcome;

  const projectedOccupancy = Math.max(0, Math.round(currentOccupancy + netChange));
  const remaining = maxCapacity - currentOccupancy;

  let daysUntilCapacity = -1;
  if (netChange > 0 && remaining > 0) {
    daysUntilCapacity = Math.ceil((remaining / netChange) * 30);
  }

  const scenario = `${intakeChangePercent >= 0 ? '+' : ''}${intakeChangePercent}% intake, ${adoptionChangePercent >= 0 ? '+' : ''}${adoptionChangePercent}% outcomes`;

  let recommendation: string;
  if (daysUntilCapacity > 0 && daysUntilCapacity < 60) {
    recommendation = 'Capacity risk within 60 days. Increase adoption events and transfer partnerships.';
  } else if (daysUntilCapacity > 0 && daysUntilCapacity < 180) {
    recommendation = 'Monitor capacity closely. Plan for increased transfers or foster placements.';
  } else if (netChange < 0) {
    recommendation = 'Occupancy projected to decrease. Consider accepting transfers from overcrowded shelters.';
  } else {
    recommendation = 'Current trajectory is sustainable.';
  }

  return {
    scenario,
    projectedOccupancy,
    daysUntilCapacity: daysUntilCapacity < 0 ? 999 : daysUntilCapacity,
    recommendation,
  };
}

/**
 * Prioritize insights by severity.
 */
export function prioritizeInsights(insights: Insight[]): Insight[] {
  const severityOrder: Record<string, number> = { critical: 0, high: 1, warning: 2, info: 3 };
  return [...insights].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));
}

/**
 * Store feedback for an insight.
 */
export function submitInsightFeedback(insightId: string, rating: 'helpful' | 'not_helpful', comment?: string): void {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const feedback: InsightFeedback[] = raw ? JSON.parse(raw) : [];
    feedback.push({ insightId, rating, comment, timestamp: Date.now() });
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  } catch {
    // Storage unavailable
  }
}

/**
 * Get all insight feedback.
 */
export function getInsightFeedback(): InsightFeedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Dismiss an insight so it won't be shown again.
 */
export function dismissInsight(insightId: string): void {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const dismissed: string[] = raw ? JSON.parse(raw) : [];
    if (!dismissed.includes(insightId)) {
      dismissed.push(insightId);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // Storage unavailable
  }
}

/**
 * Filter out dismissed insights.
 */
export function filterDismissedInsights(insights: Insight[]): Insight[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const dismissed: string[] = raw ? JSON.parse(raw) : [];
    return insights.filter(i => !dismissed.includes(i.id));
  } catch {
    return insights;
  }
}

/**
 * Get the feedback effectiveness rate for a category.
 */
export function getCategoryEffectiveness(category: string): { helpful: number; total: number; rate: number } {
  const feedback = getInsightFeedback();
  const categoryFeedback = feedback.filter(f => f.insightId.includes(category));
  const helpful = categoryFeedback.filter(f => f.rating === 'helpful').length;
  const total = categoryFeedback.length;
  return {
    helpful,
    total,
    rate: total > 0 ? Math.round((helpful / total) * 100) : 0,
  };
}
