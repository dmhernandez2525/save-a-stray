// ── Predictive Analytics Engine ───────────────────────────────
// Adoption likelihood, length-of-stay prediction, demand forecasting

// ── Adoption Likelihood Scoring ──────────────────────────────

export interface AdoptionPrediction {
  animalId: string;
  likelihood: number;        // 0-100
  estimatedDays: number;     // days until adoption
  confidence: number;        // 0-100
  factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

export interface AnimalFeatures {
  id: string;
  species: string;
  breed?: string;
  age?: string;
  size?: string;
  daysInShelter: number;
  hasPhotos: boolean;
  photoCount: number;
  hasVideo: boolean;
  spayedNeutered: boolean;
  houseTrained: boolean;
  goodWithKids: boolean;
  goodWithDogs: boolean;
  goodWithCats: boolean;
  specialNeeds: boolean;
  listingViews: number;
  favoriteCount: number;
  applicationCount: number;
}

const ADOPTION_FACTORS: {
  name: string;
  weight: number;
  evaluate: (animal: AnimalFeatures) => { score: number; impact: 'positive' | 'negative' | 'neutral' };
}[] = [
  {
    name: 'Species Demand',
    weight: 10,
    evaluate(a) {
      if (a.species === 'dog') return { score: 70, impact: 'positive' };
      if (a.species === 'cat') return { score: 60, impact: 'neutral' };
      return { score: 40, impact: 'negative' };
    },
  },
  {
    name: 'Age Appeal',
    weight: 15,
    evaluate(a) {
      if (a.age === 'puppy' || a.age === 'kitten') return { score: 95, impact: 'positive' };
      if (a.age === 'young') return { score: 80, impact: 'positive' };
      if (a.age === 'adult') return { score: 60, impact: 'neutral' };
      if (a.age === 'senior') return { score: 30, impact: 'negative' };
      return { score: 50, impact: 'neutral' };
    },
  },
  {
    name: 'Photo Quality',
    weight: 12,
    evaluate(a) {
      if (!a.hasPhotos) return { score: 10, impact: 'negative' };
      if (a.photoCount >= 5) return { score: 90, impact: 'positive' };
      if (a.photoCount >= 3) return { score: 70, impact: 'positive' };
      return { score: 40, impact: 'neutral' };
    },
  },
  {
    name: 'Size Preference',
    weight: 8,
    evaluate(a) {
      if (a.size === 'medium') return { score: 75, impact: 'positive' };
      if (a.size === 'small') return { score: 70, impact: 'positive' };
      if (a.size === 'large') return { score: 55, impact: 'neutral' };
      return { score: 45, impact: 'neutral' };
    },
  },
  {
    name: 'Compatibility',
    weight: 15,
    evaluate(a) {
      let score = 50;
      if (a.goodWithKids) score += 15;
      if (a.goodWithDogs) score += 10;
      if (a.goodWithCats) score += 10;
      if (a.houseTrained) score += 10;
      if (a.spayedNeutered) score += 5;
      return { score: Math.min(100, score), impact: score > 70 ? 'positive' : 'neutral' };
    },
  },
  {
    name: 'Special Needs Impact',
    weight: 10,
    evaluate(a) {
      if (a.specialNeeds) return { score: 25, impact: 'negative' };
      return { score: 75, impact: 'positive' };
    },
  },
  {
    name: 'Engagement Level',
    weight: 15,
    evaluate(a) {
      const engagementScore = Math.min(100, (a.listingViews / 5) + (a.favoriteCount * 10) + (a.applicationCount * 25));
      if (engagementScore >= 80) return { score: 95, impact: 'positive' };
      if (engagementScore >= 40) return { score: 65, impact: 'neutral' };
      return { score: 25, impact: 'negative' };
    },
  },
  {
    name: 'Time in Shelter',
    weight: 15,
    evaluate(a) {
      if (a.daysInShelter <= 7) return { score: 85, impact: 'positive' };
      if (a.daysInShelter <= 30) return { score: 65, impact: 'neutral' };
      if (a.daysInShelter <= 90) return { score: 40, impact: 'negative' };
      return { score: 20, impact: 'negative' };
    },
  },
];

export function predictAdoption(animal: AnimalFeatures): AdoptionPrediction {
  const factors = ADOPTION_FACTORS.map(f => {
    const result = f.evaluate(animal);
    return { factor: f.name, impact: result.impact, weight: f.weight, score: result.score };
  });

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const likelihood = Math.round(factors.reduce((sum, f) => sum + (f.score * f.weight), 0) / totalWeight);
  const confidence = Math.min(85, 40 + (animal.daysInShelter > 0 ? 15 : 0) + (animal.listingViews > 10 ? 15 : 0) + (animal.photoCount > 0 ? 15 : 0));

  // Estimate days based on likelihood (inversely proportional)
  const estimatedDays = likelihood >= 80 ? Math.round(14 - (likelihood - 80) * 0.35)
    : likelihood >= 60 ? Math.round(35 - (likelihood - 60) * 1.05)
    : likelihood >= 40 ? Math.round(60 - (likelihood - 40) * 1.25)
    : Math.round(120 - likelihood * 1.5);

  const riskLevel = likelihood >= 60 ? 'low' : likelihood >= 40 ? 'medium' : 'high';

  const recommendedActions: string[] = [];
  if (!animal.hasPhotos) recommendedActions.push('Add photos to significantly increase visibility');
  if (animal.photoCount < 3) recommendedActions.push('Add more photos (aim for 5+)');
  if (!animal.hasVideo) recommendedActions.push('Add a video to showcase personality');
  if (animal.daysInShelter > 30) recommendedActions.push('Consider featuring in promotional campaigns');
  if (animal.favoriteCount > 3 && animal.applicationCount === 0) recommendedActions.push('High interest but no applications; review adoption fee or requirements');
  if (riskLevel === 'high') recommendedActions.push('Prioritize for marketing and social media promotion');

  return {
    animalId: animal.id,
    likelihood,
    estimatedDays,
    confidence,
    factors: factors.map(f => ({ factor: f.factor, impact: f.impact, weight: f.weight })),
    riskLevel,
    recommendedActions,
  };
}

// ── Length of Stay Prediction ─────────────────────────────────

export interface LosStats {
  averageDays: number;
  medianDays: number;
  p90Days: number;
  bySpecies: Record<string, number>;
  byAge: Record<string, number>;
  trend: 'improving' | 'stable' | 'worsening';
}

export function calculateLosStats(stays: { species: string; age: string; days: number }[]): LosStats {
  if (stays.length === 0) {
    return { averageDays: 0, medianDays: 0, p90Days: 0, bySpecies: {}, byAge: {}, trend: 'stable' };
  }

  const sorted = [...stays].sort((a, b) => a.days - b.days);
  const total = sorted.reduce((sum, s) => sum + s.days, 0);
  const averageDays = Math.round(total / sorted.length);
  const medianDays = sorted[Math.floor(sorted.length / 2)].days;
  const p90Days = sorted[Math.floor(sorted.length * 0.9)].days;

  const bySpecies: Record<string, number> = {};
  const byAge: Record<string, number> = {};
  const speciesCounts: Record<string, number> = {};
  const ageCounts: Record<string, number> = {};

  for (const s of stays) {
    bySpecies[s.species] = (bySpecies[s.species] || 0) + s.days;
    speciesCounts[s.species] = (speciesCounts[s.species] || 0) + 1;
    byAge[s.age] = (byAge[s.age] || 0) + s.days;
    ageCounts[s.age] = (ageCounts[s.age] || 0) + 1;
  }

  for (const key of Object.keys(bySpecies)) {
    bySpecies[key] = Math.round(bySpecies[key] / speciesCounts[key]);
  }
  for (const key of Object.keys(byAge)) {
    byAge[key] = Math.round(byAge[key] / ageCounts[key]);
  }

  // Simple trend calculation: compare first half to second half of input order (chronological)
  const midpoint = Math.floor(stays.length / 2);
  const firstHalf = stays.slice(0, midpoint);
  const secondHalf = stays.slice(midpoint);
  const firstAvg = firstHalf.reduce((s, x) => s + x.days, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((s, x) => s + x.days, 0) / (secondHalf.length || 1);
  const trend = secondAvg < firstAvg * 0.9 ? 'improving' : secondAvg > firstAvg * 1.1 ? 'worsening' : 'stable';

  return { averageDays, medianDays, p90Days, bySpecies, byAge, trend };
}

// ── At-Risk Animal Detection ─────────────────────────────────

export interface AtRiskAlert {
  animalId: string;
  riskScore: number;
  daysInShelter: number;
  reason: string;
  urgency: 'critical' | 'high' | 'medium';
  suggestedAction: string;
}

export function identifyAtRiskAnimals(
  animals: { id: string; daysInShelter: number; adoptionLikelihood: number; species: string; specialNeeds: boolean }[],
  thresholds: { criticalDays?: number; highDays?: number; lowLikelihood?: number } = {}
): AtRiskAlert[] {
  const { criticalDays = 90, highDays = 60, lowLikelihood = 30 } = thresholds;

  return animals
    .filter(a => a.daysInShelter >= highDays || a.adoptionLikelihood <= lowLikelihood)
    .map(a => {
      let urgency: 'critical' | 'high' | 'medium' = 'medium';
      let reason = '';
      let suggestedAction = '';

      if (a.daysInShelter >= criticalDays) {
        urgency = 'critical';
        reason = `Extended stay: ${a.daysInShelter} days in shelter`;
        suggestedAction = 'Immediate intervention needed: feature on social media, consider foster placement, reduce adoption fee';
      } else if (a.daysInShelter >= highDays) {
        urgency = 'high';
        reason = `Long stay: ${a.daysInShelter} days in shelter`;
        suggestedAction = 'Prioritize for marketing campaigns and cross-posting to partner platforms';
      } else {
        reason = `Low adoption likelihood: ${a.adoptionLikelihood}%`;
        suggestedAction = 'Improve listing with better photos and detailed description';
      }

      const riskScore = Math.min(100, Math.round((a.daysInShelter / criticalDays) * 50 + ((100 - a.adoptionLikelihood) / 100) * 50));

      return { animalId: a.id, riskScore, daysInShelter: a.daysInShelter, reason, urgency, suggestedAction };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

// ── Demand Forecasting ───────────────────────────────────────

export interface DemandForecast {
  period: string;
  expectedIntake: number;
  expectedAdoptions: number;
  netChange: number;
  seasonalFactor: number;
  confidence: number;
}

export const SEASONAL_FACTORS: Record<string, number> = {
  january: 0.85, february: 0.90, march: 1.10, april: 1.25,
  may: 1.30, june: 1.35, july: 1.20, august: 1.10,
  september: 0.95, october: 0.90, november: 0.80, december: 0.75,
};

export function forecastDemand(
  historicalIntake: number,
  historicalAdoptions: number,
  month: string,
  growthRate: number = 0.05
): DemandForecast {
  const factor = SEASONAL_FACTORS[month.toLowerCase()] || 1.0;
  const expectedIntake = Math.round(historicalIntake * factor * (1 + growthRate));
  const expectedAdoptions = Math.round(historicalAdoptions * factor * (1 + growthRate));
  const netChange = expectedIntake - expectedAdoptions;
  // Confidence based on data quality: higher when using known seasonal factors
  const confidence = factor !== 1.0 ? 75 : 65;

  return { period: month, expectedIntake, expectedAdoptions, netChange, seasonalFactor: factor, confidence };
}

export function forecastYear(
  monthlyIntake: number,
  monthlyAdoptions: number,
  growthRate: number = 0.05
): DemandForecast[] {
  const months = Object.keys(SEASONAL_FACTORS);
  return months.map(month => forecastDemand(monthlyIntake, monthlyAdoptions, month, growthRate));
}

// ── Optimal Posting Times ────────────────────────────────────

export interface PostingTimeRecommendation {
  dayOfWeek: string;
  hour: number;
  engagementScore: number;
  label: string;
}

export const OPTIMAL_POSTING_TIMES: PostingTimeRecommendation[] = [
  { dayOfWeek: 'Monday', hour: 10, engagementScore: 75, label: 'Good' },
  { dayOfWeek: 'Tuesday', hour: 11, engagementScore: 82, label: 'Great' },
  { dayOfWeek: 'Wednesday', hour: 10, engagementScore: 78, label: 'Good' },
  { dayOfWeek: 'Thursday', hour: 14, engagementScore: 80, label: 'Great' },
  { dayOfWeek: 'Friday', hour: 9, engagementScore: 70, label: 'Good' },
  { dayOfWeek: 'Saturday', hour: 11, engagementScore: 90, label: 'Best' },
  { dayOfWeek: 'Sunday', hour: 12, engagementScore: 88, label: 'Best' },
];

export function getBestPostingTimes(topN: number = 3): PostingTimeRecommendation[] {
  return [...OPTIMAL_POSTING_TIMES]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, topN);
}

// ── Prediction Accuracy Tracking ─────────────────────────────

export interface PredictionAccuracy {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  meanAbsoluteError: number;
}

export function calculateAccuracy(
  predictions: { predicted: number; actual: number }[]
): PredictionAccuracy {
  if (predictions.length === 0) {
    return { totalPredictions: 0, correctPredictions: 0, accuracy: 0, meanAbsoluteError: 0 };
  }

  const threshold = 15; // Within 15% is "correct"
  let correct = 0;
  let totalError = 0;

  for (const p of predictions) {
    const error = Math.abs(p.predicted - p.actual);
    const percentError = p.actual > 0 ? (error / p.actual) * 100 : error;
    if (percentError <= threshold) correct++;
    totalError += error;
  }

  return {
    totalPredictions: predictions.length,
    correctPredictions: correct,
    accuracy: Math.round((correct / predictions.length) * 100),
    meanAbsoluteError: Math.round(totalError / predictions.length),
  };
}
