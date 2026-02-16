import { FosterProfileDocument } from '../models/FosterProfile';
import { AnimalDocument } from '../models/Animal';

interface FosterMatchResult {
  fosterProfileId: string;
  userId: string;
  score: number;
  factors: Record<string, number>;
}

const DEFAULT_WEIGHTS = {
  animalType: 25,
  size: 15,
  medicalNeeds: 15,
  behavioralNeeds: 10,
  experience: 15,
  capacity: 10,
  duration: 10,
};

export function calculateFosterMatchScore(
  profile: FosterProfileDocument,
  animal: AnimalDocument,
  weights = DEFAULT_WEIGHTS,
): FosterMatchResult {
  const factors: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animalData = animal as any;

  // Animal type compatibility
  if (profile.acceptedAnimalTypes.length === 0) {
    factors.animalType = 50;
  } else {
    factors.animalType = profile.acceptedAnimalTypes.includes(animal.type) ? 100 : 0;
  }

  // Size preference
  const animalSize = animalData.size as string | undefined;
  if (profile.preferences.preferredSizes.length === 0 || !animalSize) {
    factors.size = 50;
  } else {
    factors.size = profile.preferences.preferredSizes.includes(animalSize) ? 100 : 20;
  }

  // Medical needs
  const hasMedical = animalData.medicalNotes
    && (animalData.medicalNotes as string).length > 0;
  if (hasMedical) {
    factors.medicalNeeds = profile.preferences.acceptsMedicalNeeds ? 100 : 10;
  } else {
    factors.medicalNeeds = 80;
  }

  // Behavioral needs
  const temperament = animalData.temperament as string | undefined;
  const hasBehavioral = temperament
    && ['aggressive', 'fearful', 'anxious'].some(
      t => temperament.toLowerCase().includes(t)
    );
  if (hasBehavioral) {
    factors.behavioralNeeds = profile.preferences.acceptsBehavioralNeeds ? 100 : 10;
  } else {
    factors.behavioralNeeds = 80;
  }

  // Experience level
  const totalYears = profile.experience.reduce((sum, e) => sum + e.years, 0);
  const fosterExp = profile.experience.some(e => e.isFosterExperience);
  if (totalYears >= 5 || fosterExp) {
    factors.experience = 100;
  } else if (totalYears >= 2) {
    factors.experience = 70;
  } else if (totalYears >= 1) {
    factors.experience = 50;
  } else {
    factors.experience = 30;
  }

  // Capacity check
  const availableSlots = profile.maxAnimals - profile.currentAnimalCount;
  if (availableSlots <= 0) {
    factors.capacity = 0;
  } else if (availableSlots >= 2) {
    factors.capacity = 100;
  } else {
    factors.capacity = 60;
  }

  // Duration compatibility
  factors.duration = 70;

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += (factors[key] ?? 0) * (weight / totalWeight);
  }

  return {
    fosterProfileId: profile._id.toString(),
    userId: profile.userId,
    score: Math.round(score),
    factors,
  };
}

export function isAvailable(profile: FosterProfileDocument, date: Date = new Date()): boolean {
  if (profile.status !== 'active') return false;
  if (profile.currentAnimalCount >= profile.maxAnimals) return false;
  if (profile.availableFrom && date < profile.availableFrom) return false;
  if (profile.availableUntil && date > profile.availableUntil) return false;
  const isBlackedOut = profile.blackoutDates.some(
    bd => date >= bd.start && date <= bd.end
  );
  if (isBlackedOut) return false;
  return true;
}
