// ── AI Pet Matching Engine ────────────────────────────────────
// Compatibility scoring, lifestyle questionnaire, and match explanations

// ── Lifestyle Questionnaire ──────────────────────────────────

export interface QuestionnaireQuestion {
  id: string;
  category: string;
  question: string;
  type: 'single' | 'multiple' | 'scale' | 'boolean';
  options?: { value: string; label: string; weight?: Record<string, number> }[];
  scaleMin?: number;
  scaleMax?: number;
}

export const LIFESTYLE_QUESTIONNAIRE: QuestionnaireQuestion[] = [
  {
    id: 'housing', category: 'Living Situation', question: 'What type of housing do you live in?',
    type: 'single',
    options: [
      { value: 'house_yard', label: 'House with yard', weight: { size_large: 3, energy_high: 2 } },
      { value: 'house_no_yard', label: 'House without yard', weight: { size_medium: 2, energy_medium: 1 } },
      { value: 'apartment', label: 'Apartment', weight: { size_small: 3, energy_low: 2, noise_low: 2 } },
      { value: 'condo', label: 'Condo/Townhouse', weight: { size_medium: 2, energy_medium: 1, noise_low: 1 } },
    ],
  },
  {
    id: 'activity_level', category: 'Lifestyle', question: 'How active is your daily lifestyle?',
    type: 'scale', scaleMin: 1, scaleMax: 5,
  },
  {
    id: 'hours_away', category: 'Lifestyle', question: 'How many hours are you typically away from home?',
    type: 'single',
    options: [
      { value: 'less_4', label: 'Less than 4 hours', weight: { independence_low: 3 } },
      { value: '4_8', label: '4-8 hours', weight: { independence_medium: 2 } },
      { value: 'more_8', label: 'More than 8 hours', weight: { independence_high: 3 } },
    ],
  },
  {
    id: 'children', category: 'Family', question: 'Do you have children at home?',
    type: 'boolean',
  },
  {
    id: 'children_ages', category: 'Family', question: 'What are the ages of your children?',
    type: 'multiple',
    options: [
      { value: 'toddler', label: 'Under 5', weight: { kid_friendly: 3, gentle: 3 } },
      { value: 'child', label: '5-12', weight: { kid_friendly: 2 } },
      { value: 'teen', label: '13+', weight: { kid_friendly: 1 } },
    ],
  },
  {
    id: 'other_pets', category: 'Family', question: 'Do you currently have other pets?',
    type: 'multiple',
    options: [
      { value: 'dogs', label: 'Dogs', weight: { dog_friendly: 3 } },
      { value: 'cats', label: 'Cats', weight: { cat_friendly: 3 } },
      { value: 'small_animals', label: 'Small animals', weight: { prey_drive_low: 2 } },
      { value: 'none', label: 'No other pets', weight: {} },
    ],
  },
  {
    id: 'experience', category: 'Experience', question: 'How much experience do you have with pets?',
    type: 'single',
    options: [
      { value: 'first_time', label: 'First-time pet owner', weight: { easy_care: 3, training_easy: 2 } },
      { value: 'some', label: 'Some experience', weight: { moderate_care: 2 } },
      { value: 'experienced', label: 'Very experienced', weight: { any_temperament: 1 } },
    ],
  },
  {
    id: 'exercise', category: 'Lifestyle', question: 'How much daily exercise can you provide?',
    type: 'single',
    options: [
      { value: 'minimal', label: 'Short walks (15-30 min)', weight: { energy_low: 3 } },
      { value: 'moderate', label: 'Moderate (30-60 min)', weight: { energy_medium: 3 } },
      { value: 'active', label: 'Active (1-2 hours)', weight: { energy_high: 3 } },
      { value: 'very_active', label: 'Very active (2+ hours)', weight: { energy_very_high: 3 } },
    ],
  },
  {
    id: 'grooming', category: 'Preferences', question: 'How much grooming are you willing to do?',
    type: 'scale', scaleMin: 1, scaleMax: 5,
  },
  {
    id: 'size_preference', category: 'Preferences', question: 'What size pet do you prefer?',
    type: 'multiple',
    options: [
      { value: 'small', label: 'Small (under 25 lbs)', weight: { size_small: 3 } },
      { value: 'medium', label: 'Medium (25-60 lbs)', weight: { size_medium: 3 } },
      { value: 'large', label: 'Large (60-100 lbs)', weight: { size_large: 3 } },
      { value: 'any', label: 'No preference', weight: {} },
    ],
  },
  {
    id: 'noise_tolerance', category: 'Preferences', question: 'How much noise can you tolerate?',
    type: 'scale', scaleMin: 1, scaleMax: 5,
  },
  {
    id: 'special_needs', category: 'Preferences', question: 'Would you consider a special needs animal?',
    type: 'boolean',
  },
];

// ── Pet Profile Traits ───────────────────────────────────────

export interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  size?: string;
  energyLevel?: string;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  houseTrained?: boolean;
  specialNeeds?: boolean;
  temperament?: string[];
  trainability?: string;
  noiseLevel?: string;
  groomingNeeds?: string;
  independenceLevel?: string;
}

// ── Matching Engine ──────────────────────────────────────────

export interface MatchScore {
  petId: string;
  petName: string;
  overallScore: number;
  confidence: number;
  breakdown: { factor: string; score: number; weight: number; explanation: string }[];
  topReasons: string[];
  concerns: string[];
}

interface MatchFactor {
  name: string;
  weight: number;
  evaluate: (answers: Record<string, string | string[] | number | boolean>, pet: PetProfile) => { score: number; explanation: string };
}

const MATCH_FACTORS: MatchFactor[] = [
  {
    name: 'Size Compatibility',
    weight: 15,
    evaluate(answers, pet) {
      if (!pet.size) return { score: 50, explanation: 'Size information not available' };
      const prefs = answers.size_preference;
      if (!prefs || (Array.isArray(prefs) && prefs.includes('any'))) {
        return { score: 80, explanation: 'No size preference specified' };
      }
      const sizeMap: Record<string, string> = { small: 'small', medium: 'medium', large: 'large', 'extra-large': 'large' };
      const petSize = sizeMap[pet.size] || pet.size;
      if (Array.isArray(prefs) && prefs.includes(petSize)) {
        return { score: 100, explanation: `${pet.name} is the right size for your home` };
      }
      return { score: 30, explanation: `${pet.name} may be a different size than preferred` };
    },
  },
  {
    name: 'Energy Match',
    weight: 20,
    evaluate(answers, pet) {
      if (!pet.energyLevel) return { score: 50, explanation: 'Energy level not specified' };
      const exercise = answers.exercise as string;
      const levelMap: Record<string, number> = { low: 1, medium: 2, high: 3, 'very high': 4 };
      const exerciseMap: Record<string, number> = { minimal: 1, moderate: 2, active: 3, very_active: 4 };
      const petLevel = levelMap[pet.energyLevel] || 2;
      const userLevel = exerciseMap[exercise] || 2;
      const diff = Math.abs(petLevel - userLevel);
      if (diff === 0) return { score: 100, explanation: `Great energy match! ${pet.name} fits your activity level perfectly` };
      if (diff === 1) return { score: 70, explanation: `${pet.name}'s energy level is close to your activity level` };
      return { score: 30, explanation: `${pet.name} may need more or less exercise than you can provide` };
    },
  },
  {
    name: 'Kid Compatibility',
    weight: 20,
    evaluate(answers, pet) {
      const hasChildren = answers.children === true || answers.children === 'true';
      if (!hasChildren) return { score: 80, explanation: 'No children in household' };
      if (pet.goodWithKids === true) return { score: 100, explanation: `${pet.name} is great with children` };
      if (pet.goodWithKids === false) return { score: 10, explanation: `${pet.name} may not be suitable for homes with children` };
      return { score: 50, explanation: 'Kid compatibility unknown; meet-and-greet recommended' };
    },
  },
  {
    name: 'Pet Compatibility',
    weight: 15,
    evaluate(answers, pet) {
      const otherPets = answers.other_pets;
      if (!otherPets || (Array.isArray(otherPets) && otherPets.includes('none'))) {
        return { score: 90, explanation: 'No other pets to consider' };
      }
      let score = 80;
      const notes: string[] = [];
      if (Array.isArray(otherPets)) {
        if (otherPets.includes('dogs')) {
          if (pet.goodWithDogs === true) { score = Math.max(score, 90); notes.push('good with dogs'); }
          else if (pet.goodWithDogs === false) { score = Math.min(score, 20); notes.push('not recommended with dogs'); }
        }
        if (otherPets.includes('cats')) {
          if (pet.goodWithCats === true) { score = Math.max(score, 90); notes.push('good with cats'); }
          else if (pet.goodWithCats === false) { score = Math.min(score, 20); notes.push('not recommended with cats'); }
        }
      }
      const explanation = notes.length > 0 ? `${pet.name}: ${notes.join(', ')}` : 'Pet compatibility not specified';
      return { score, explanation };
    },
  },
  {
    name: 'Housing Match',
    weight: 10,
    evaluate(answers, pet) {
      const housing = answers.housing as string;
      if (!housing || !pet.size) return { score: 60, explanation: 'Housing match undetermined' };
      if (housing === 'apartment' && (pet.size === 'large' || pet.size === 'extra-large')) {
        return { score: 25, explanation: `A large pet like ${pet.name} may not be comfortable in an apartment` };
      }
      if (housing === 'house_yard') {
        return { score: 95, explanation: `Your house with yard is great for ${pet.name}` };
      }
      return { score: 70, explanation: 'Housing appears suitable' };
    },
  },
  {
    name: 'Experience Match',
    weight: 10,
    evaluate(answers, pet) {
      const exp = answers.experience as string;
      if (exp === 'first_time') {
        if (pet.specialNeeds) return { score: 20, explanation: 'Special needs pets are recommended for experienced owners' };
        if (pet.temperament?.includes('challenging')) return { score: 30, explanation: `${pet.name} may be challenging for first-time owners` };
        return { score: 70, explanation: 'Good match for a first-time owner' };
      }
      if (exp === 'experienced') return { score: 90, explanation: 'Your experience is a great asset' };
      return { score: 75, explanation: 'Suitable for your experience level' };
    },
  },
  {
    name: 'Special Needs',
    weight: 10,
    evaluate(answers, pet) {
      if (!pet.specialNeeds) return { score: 80, explanation: 'No special needs' };
      const willing = answers.special_needs === true || answers.special_needs === 'true';
      if (willing) return { score: 90, explanation: `You are open to special needs. ${pet.name} would appreciate your care.` };
      return { score: 20, explanation: `${pet.name} has special needs that may require extra attention` };
    },
  },
];

export function calculateMatchScore(
  answers: Record<string, string | string[] | number | boolean>,
  pet: PetProfile
): MatchScore {
  const breakdown = MATCH_FACTORS.map(factor => {
    const result = factor.evaluate(answers, pet);
    return {
      factor: factor.name,
      score: result.score,
      weight: factor.weight,
      explanation: result.explanation,
    };
  });

  const totalWeight = breakdown.reduce((sum, b) => sum + b.weight, 0);
  const weightedScore = breakdown.reduce((sum, b) => sum + (b.score * b.weight), 0);
  const overallScore = Math.round(weightedScore / totalWeight);

  // Calculate confidence based on how much data we have
  const nonDefaultScores = breakdown.filter(b => b.score !== 50);
  const confidence = Math.round((nonDefaultScores.length / breakdown.length) * 100);

  // Extract top reasons and concerns
  const sortedByScore = [...breakdown].sort((a, b) => b.score - a.score);
  const topReasons = sortedByScore
    .filter(b => b.score >= 70)
    .slice(0, 3)
    .map(b => b.explanation);

  const concerns = sortedByScore
    .filter(b => b.score < 40)
    .map(b => b.explanation);

  return {
    petId: pet.id,
    petName: pet.name,
    overallScore,
    confidence,
    breakdown,
    topReasons,
    concerns,
  };
}

export function rankMatches(
  answers: Record<string, string | string[] | number | boolean>,
  pets: PetProfile[]
): MatchScore[] {
  return pets
    .map(pet => calculateMatchScore(answers, pet))
    .sort((a, b) => b.overallScore - a.overallScore);
}

// ── Match Quality Labels ─────────────────────────────────────

export function getMatchLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent Match', color: '#22c55e' };
  if (score >= 75) return { label: 'Great Match', color: '#84cc16' };
  if (score >= 60) return { label: 'Good Match', color: '#eab308' };
  if (score >= 40) return { label: 'Fair Match', color: '#f97316' };
  return { label: 'Low Match', color: '#ef4444' };
}

// ── Questionnaire Validation ─────────────────────────────────

export function validateQuestionnaireAnswers(
  answers: Record<string, unknown>
): { valid: boolean; missing: string[]; warnings: string[] } {
  const required = ['housing', 'activity_level', 'experience', 'exercise'];
  const missing = required.filter(id => !(id in answers));
  const warnings: string[] = [];

  if (answers.children === true && !answers.children_ages) {
    warnings.push('Please specify children ages for better matching');
  }

  return { valid: missing.length === 0, missing, warnings };
}

export function getQuestionnaireProgress(answers: Record<string, unknown>): {
  answered: number;
  total: number;
  percentage: number;
} {
  const total = LIFESTYLE_QUESTIONNAIRE.length;
  const answered = LIFESTYLE_QUESTIONNAIRE.filter(q => q.id in answers).length;
  return { answered, total, percentage: Math.round((answered / total) * 100) };
}
