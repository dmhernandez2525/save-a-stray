import { AdopterProfileDocument } from '../models/AdopterProfile';

interface AnimalData {
  _id: string;
  type: string;
  size?: string;
  energyLevel?: string;
  age: number;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  houseTrained?: boolean;
  specialNeeds?: string;
}

interface MatchWeights {
  species: number;
  size: number;
  energy: number;
  age: number;
  kidFriendly: number;
  petFriendly: number;
  experience: number;
  housing: number;
}

const DEFAULT_WEIGHTS: MatchWeights = {
  species: 20,
  size: 15,
  energy: 15,
  age: 10,
  kidFriendly: 15,
  petFriendly: 10,
  experience: 10,
  housing: 5,
};

interface MatchResult {
  animalId: string;
  score: number;
  factors: Record<string, number>;
}

const ageCategory = (age: number): string => {
  if (age < 1) return 'puppy_kitten';
  if (age <= 3) return 'young';
  if (age <= 8) return 'adult';
  return 'senior';
};

const energyMatch = (profileLevel: string, animalLevel: string | undefined): number => {
  if (!animalLevel) return 50;
  const levels: Record<string, number> = { low: 1, moderate: 2, high: 3 };
  const profileMap: Record<string, number> = { sedentary: 1, moderate: 2, active: 3, very_active: 3 };
  const pVal = profileMap[profileLevel] ?? 2;
  const aVal = levels[animalLevel] ?? 2;
  const diff = Math.abs(pVal - aVal);
  if (diff === 0) return 100;
  if (diff === 1) return 60;
  return 20;
};

const sizeHousingScore = (housing: string, hasYard: boolean, size: string | undefined): number => {
  if (!size) return 50;
  const sizeMap: Record<string, number> = { small: 1, medium: 2, large: 3, 'extra-large': 4 };
  const sizeVal = sizeMap[size] ?? 2;

  if (housing === 'apartment' || housing === 'condo') {
    if (sizeVal <= 2) return 100;
    if (sizeVal === 3) return hasYard ? 50 : 20;
    return 10;
  }
  if (housing === 'farm') return 100;
  // house/townhouse
  if (sizeVal <= 2) return 100;
  return hasYard ? 80 : 50;
};

export function calculateMatchScore(
  profile: AdopterProfileDocument,
  animal: AnimalData,
  weights: Partial<MatchWeights> = {}
): MatchResult {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const factors: Record<string, number> = {};

  // Species match
  if (profile.preferredSpecies.length > 0) {
    factors.species = profile.preferredSpecies.includes(animal.type) ? 100 : 0;
  } else {
    factors.species = 100;
  }

  // Size match
  if (profile.preferredSize.length > 0 && animal.size) {
    factors.size = profile.preferredSize.includes(animal.size) ? 100 : 30;
  } else {
    factors.size = 70;
  }

  // Energy match
  factors.energy = energyMatch(profile.activityLevel, animal.energyLevel);

  // Age match
  const animalAge = ageCategory(animal.age);
  if (profile.preferredAge === 'any') {
    factors.age = 80;
  } else {
    factors.age = profile.preferredAge === animalAge ? 100 : 40;
  }

  // Kid-friendly
  if (profile.hasChildren) {
    factors.kidFriendly = animal.goodWithKids === true ? 100 : (animal.goodWithKids === false ? 10 : 50);
  } else {
    factors.kidFriendly = 80;
  }

  // Pet-friendly
  if (profile.hasOtherPets) {
    const hasDog = profile.otherPetTypes.includes('dog');
    const hasCat = profile.otherPetTypes.includes('cat');
    let petScore = 80;
    if (hasDog && animal.goodWithDogs === false) petScore = 10;
    else if (hasDog && animal.goodWithDogs === true) petScore = 100;
    if (hasCat && animal.goodWithCats === false) petScore = Math.min(petScore, 10);
    else if (hasCat && animal.goodWithCats === true) petScore = Math.max(petScore, 100);
    factors.petFriendly = petScore;
  } else {
    factors.petFriendly = 80;
  }

  // Experience
  const expMap: Record<string, number> = { first_time: 1, some: 2, experienced: 3, professional: 4 };
  const expVal = expMap[profile.experienceLevel] ?? 2;
  if (animal.specialNeeds && animal.specialNeeds.length > 0) {
    factors.experience = expVal >= 3 ? 100 : 30;
  } else {
    factors.experience = 80;
  }

  // Housing
  factors.housing = sizeHousingScore(profile.housingType, profile.hasYard, animal.size);

  // Calculate weighted score
  const totalWeight = w.species + w.size + w.energy + w.age + w.kidFriendly + w.petFriendly + w.experience + w.housing;
  const weightedSum =
    factors.species * w.species +
    factors.size * w.size +
    factors.energy * w.energy +
    factors.age * w.age +
    factors.kidFriendly * w.kidFriendly +
    factors.petFriendly * w.petFriendly +
    factors.experience * w.experience +
    factors.housing * w.housing;

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return {
    animalId: animal._id.toString(),
    score,
    factors,
  };
}
