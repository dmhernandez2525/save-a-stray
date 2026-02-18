// ── Image Recognition & Analysis ─────────────────────────────
// Breed detection, quality scoring, duplicate detection, and auto-tagging

// ── Breed Detection ──────────────────────────────────────────

export interface BreedPrediction {
  breed: string;
  confidence: number;
  group?: string;
}

export interface BreedInfo {
  name: string;
  group: string;
  sizeCategory: string;
  energyLevel: string;
  groomingNeeds: string;
  temperament: string[];
}

export const BREED_DATABASE: BreedInfo[] = [
  { name: 'Labrador Retriever', group: 'Sporting', sizeCategory: 'large', energyLevel: 'high', groomingNeeds: 'moderate', temperament: ['friendly', 'outgoing', 'active'] },
  { name: 'German Shepherd', group: 'Herding', sizeCategory: 'large', energyLevel: 'high', groomingNeeds: 'moderate', temperament: ['confident', 'courageous', 'smart'] },
  { name: 'Golden Retriever', group: 'Sporting', sizeCategory: 'large', energyLevel: 'high', groomingNeeds: 'high', temperament: ['friendly', 'intelligent', 'devoted'] },
  { name: 'French Bulldog', group: 'Non-Sporting', sizeCategory: 'small', energyLevel: 'low', groomingNeeds: 'low', temperament: ['playful', 'adaptable', 'smart'] },
  { name: 'Beagle', group: 'Hound', sizeCategory: 'medium', energyLevel: 'high', groomingNeeds: 'low', temperament: ['curious', 'friendly', 'merry'] },
  { name: 'Poodle', group: 'Non-Sporting', sizeCategory: 'medium', energyLevel: 'medium', groomingNeeds: 'high', temperament: ['intelligent', 'active', 'alert'] },
  { name: 'Bulldog', group: 'Non-Sporting', sizeCategory: 'medium', energyLevel: 'low', groomingNeeds: 'low', temperament: ['friendly', 'courageous', 'calm'] },
  { name: 'Rottweiler', group: 'Working', sizeCategory: 'large', energyLevel: 'medium', groomingNeeds: 'low', temperament: ['loyal', 'loving', 'confident'] },
  { name: 'Dachshund', group: 'Hound', sizeCategory: 'small', energyLevel: 'medium', groomingNeeds: 'low', temperament: ['curious', 'friendly', 'spunky'] },
  { name: 'Yorkshire Terrier', group: 'Toy', sizeCategory: 'small', energyLevel: 'medium', groomingNeeds: 'high', temperament: ['affectionate', 'sprightly', 'tomboyish'] },
  { name: 'Boxer', group: 'Working', sizeCategory: 'large', energyLevel: 'high', groomingNeeds: 'low', temperament: ['fun-loving', 'bright', 'active'] },
  { name: 'Siberian Husky', group: 'Working', sizeCategory: 'large', energyLevel: 'high', groomingNeeds: 'high', temperament: ['loyal', 'outgoing', 'mischievous'] },
  { name: 'Domestic Shorthair', group: 'Cat', sizeCategory: 'medium', energyLevel: 'medium', groomingNeeds: 'low', temperament: ['adaptable', 'independent', 'affectionate'] },
  { name: 'Siamese', group: 'Cat', sizeCategory: 'medium', energyLevel: 'high', groomingNeeds: 'low', temperament: ['vocal', 'social', 'intelligent'] },
  { name: 'Maine Coon', group: 'Cat', sizeCategory: 'large', energyLevel: 'medium', groomingNeeds: 'high', temperament: ['gentle', 'friendly', 'intelligent'] },
  { name: 'Persian', group: 'Cat', sizeCategory: 'medium', energyLevel: 'low', groomingNeeds: 'high', temperament: ['sweet', 'gentle', 'quiet'] },
];

export function getBreedInfo(breedName: string): BreedInfo | null {
  return BREED_DATABASE.find(b =>
    b.name.toLowerCase() === breedName.toLowerCase()
  ) || null;
}

export function searchBreeds(query: string): BreedInfo[] {
  if (!query.trim()) return [...BREED_DATABASE];
  const lower = query.toLowerCase();
  return BREED_DATABASE.filter(b =>
    b.name.toLowerCase().includes(lower) ||
    b.group.toLowerCase().includes(lower)
  );
}

export function getBreedsByGroup(group: string): BreedInfo[] {
  return BREED_DATABASE.filter(b => b.group.toLowerCase() === group.toLowerCase());
}

// Simulated breed detection (in production, this calls an ML model API)
export function detectBreed(imageFeatures: {
  size?: string;
  furLength?: string;
  earType?: string;
  colorPattern?: string;
  species?: string;
}): BreedPrediction[] {
  const candidates = BREED_DATABASE.filter(breed => {
    if (imageFeatures.species === 'cat' && breed.group !== 'Cat') return false;
    if (imageFeatures.species === 'dog' && breed.group === 'Cat') return false;
    if (imageFeatures.size && breed.sizeCategory !== imageFeatures.size) return false;
    return true;
  });

  if (candidates.length === 0) return [];

  // Simulate confidence scores
  return candidates.slice(0, 5).map((breed, index) => ({
    breed: breed.name,
    confidence: Math.max(10, 95 - (index * 18)),
    group: breed.group,
  }));
}

// ── Breed Mix Prediction ─────────────────────────────────────

export interface BreedMix {
  breeds: { name: string; percentage: number }[];
  isPurebred: boolean;
}

export function predictBreedMix(predictions: BreedPrediction[]): BreedMix {
  if (predictions.length === 0) return { breeds: [], isPurebred: false };

  const topConfidence = predictions[0].confidence;
  if (topConfidence >= 85) {
    return { breeds: [{ name: predictions[0].breed, percentage: 100 }], isPurebred: true };
  }

  const totalConfidence = predictions.slice(0, 3).reduce((sum, p) => sum + p.confidence, 0);
  const breeds = predictions.slice(0, 3).map(p => ({
    name: p.breed,
    percentage: Math.round((p.confidence / totalConfidence) * 100),
  }));

  return { breeds, isPurebred: false };
}

// ── Image Quality Scoring ────────────────────────────────────

export interface ImageQualityScore {
  overall: number;
  sharpness: number;
  lighting: number;
  composition: number;
  subjectVisibility: number;
  suggestions: string[];
}

export function scoreImageQuality(metadata: {
  width: number;
  height: number;
  fileSize: number;
  brightness?: number;  // 0-255
  contrast?: number;    // 0-100
  blurScore?: number;   // 0-100 (100 = very sharp)
  faceDetected?: boolean;
}): ImageQualityScore {
  const suggestions: string[] = [];
  let sharpness = 50;
  let lighting = 50;
  let composition = 50;
  let subjectVisibility = 50;

  // Resolution check
  const megapixels = (metadata.width * metadata.height) / 1000000;
  if (megapixels >= 2) { sharpness += 20; }
  else if (megapixels >= 1) { sharpness += 10; }
  else { suggestions.push('Use a higher resolution image (at least 1MP)'); }

  // Blur score
  if (metadata.blurScore !== undefined) {
    if (metadata.blurScore >= 70) { sharpness += 30; }
    else if (metadata.blurScore >= 40) { sharpness += 15; }
    else { sharpness -= 10; suggestions.push('Image appears blurry; try holding the camera steady'); }
  }

  // Brightness
  if (metadata.brightness !== undefined) {
    if (metadata.brightness >= 80 && metadata.brightness <= 200) { lighting += 30; }
    else if (metadata.brightness < 60) { lighting -= 20; suggestions.push('Image is too dark; try taking the photo in better lighting'); }
    else if (metadata.brightness > 220) { lighting -= 10; suggestions.push('Image is overexposed; reduce light or use a different angle'); }
    else { lighting += 15; }
  }

  // Contrast
  if (metadata.contrast !== undefined) {
    if (metadata.contrast >= 40 && metadata.contrast <= 80) { lighting += 15; }
    else if (metadata.contrast < 20) { suggestions.push('Low contrast; the subject may blend into the background'); }
  }

  // Aspect ratio / composition
  const ratio = metadata.width / metadata.height;
  if (ratio >= 0.8 && ratio <= 1.5) { composition += 25; }
  else if (ratio >= 0.5 && ratio <= 2.0) { composition += 10; }
  else { suggestions.push('Unusual aspect ratio; consider cropping to a standard format'); }

  // File size (proxy for quality)
  const fileSizeKb = metadata.fileSize / 1024;
  if (fileSizeKb >= 100) { sharpness += 5; }
  else { suggestions.push('File size is very small, which may indicate low quality'); }

  // Subject detection
  if (metadata.faceDetected) { subjectVisibility += 30; }
  else { subjectVisibility += 10; suggestions.push('Make sure the animal is clearly visible and centered'); }

  sharpness = Math.min(100, Math.max(0, sharpness));
  lighting = Math.min(100, Math.max(0, lighting));
  composition = Math.min(100, Math.max(0, composition));
  subjectVisibility = Math.min(100, Math.max(0, subjectVisibility));

  const overall = Math.round((sharpness * 0.3 + lighting * 0.25 + composition * 0.2 + subjectVisibility * 0.25));

  return { overall, sharpness, lighting, composition, subjectVisibility, suggestions };
}

export function getQualityLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

// ── Duplicate Detection ──────────────────────────────────────

export interface ImageHash {
  id: string;
  hash: string;
  animalId: string;
}

// Simple perceptual hash simulation (in production, use pHash or similar)
export function generateSimpleHash(metadata: {
  width: number;
  height: number;
  dominantColors: string[];
  averageBrightness: number;
}): string {
  const parts = [
    Math.round(metadata.width / 100),
    Math.round(metadata.height / 100),
    metadata.dominantColors.slice(0, 3).join(''),
    Math.round(metadata.averageBrightness),
  ];
  return parts.join('-');
}

export function compareSimilarity(hash1: string, hash2: string): number {
  if (hash1 === hash2) return 100;
  const parts1 = hash1.split('-');
  const parts2 = hash2.split('-');
  if (parts1.length !== parts2.length) return 0;

  let matches = 0;
  for (let i = 0; i < parts1.length; i++) {
    if (parts1[i] === parts2[i]) matches++;
  }
  return Math.round((matches / parts1.length) * 100);
}

export function findDuplicates(
  newHash: string,
  existingHashes: ImageHash[],
  threshold: number = 75
): { hash: ImageHash; similarity: number }[] {
  return existingHashes
    .map(h => ({ hash: h, similarity: compareSimilarity(newHash, h.hash) }))
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}

// ── Auto-Tagging ─────────────────────────────────────────────

export interface ImageTag {
  tag: string;
  confidence: number;
  category: string;
}

export const TAG_CATEGORIES = ['activity', 'setting', 'appearance', 'mood'] as const;

export function generateTags(metadata: {
  isOutdoor?: boolean;
  hasMultipleAnimals?: boolean;
  dominantColors?: string[];
  activity?: string;
  setting?: string;
}): ImageTag[] {
  const tags: ImageTag[] = [];

  if (metadata.isOutdoor) {
    tags.push({ tag: 'outdoor', confidence: 90, category: 'setting' });
  } else {
    tags.push({ tag: 'indoor', confidence: 85, category: 'setting' });
  }

  if (metadata.hasMultipleAnimals) {
    tags.push({ tag: 'group', confidence: 80, category: 'activity' });
  } else {
    tags.push({ tag: 'portrait', confidence: 75, category: 'activity' });
  }

  if (metadata.activity) {
    const activityTags: Record<string, number> = {
      playing: 90, sleeping: 85, eating: 80, walking: 75, sitting: 70,
    };
    const confidence = activityTags[metadata.activity] || 60;
    tags.push({ tag: metadata.activity, confidence, category: 'activity' });
  }

  if (metadata.setting) {
    tags.push({ tag: metadata.setting, confidence: 75, category: 'setting' });
  }

  if (metadata.dominantColors) {
    metadata.dominantColors.slice(0, 2).forEach(color => {
      tags.push({ tag: color, confidence: 70, category: 'appearance' });
    });
  }

  return tags.sort((a, b) => b.confidence - a.confidence);
}

// ── Coat Detection ───────────────────────────────────────────

export interface CoatAnalysis {
  primaryColor: string;
  secondaryColor?: string;
  pattern: string;
  length: string;
}

export const COAT_PATTERNS = ['solid', 'bicolor', 'tricolor', 'tabby', 'brindle', 'merle', 'spotted', 'tuxedo'] as const;
export const COAT_COLORS = ['black', 'white', 'brown', 'golden', 'red', 'cream', 'gray', 'orange', 'chocolate'] as const;
export const COAT_LENGTHS = ['short', 'medium', 'long', 'hairless', 'wire'] as const;

export function analyzeCoat(colors: string[], pattern?: string, length?: string): CoatAnalysis {
  return {
    primaryColor: colors[0] || 'unknown',
    secondaryColor: colors.length > 1 ? colors[1] : undefined,
    pattern: pattern || (colors.length > 2 ? 'tricolor' : colors.length > 1 ? 'bicolor' : 'solid'),
    length: length || 'medium',
  };
}

// ── Age Estimation ───────────────────────────────────────────

export interface AgeEstimate {
  minMonths: number;
  maxMonths: number;
  category: 'kitten' | 'puppy' | 'young' | 'adult' | 'senior';
  confidence: number;
}

export function estimateAge(features: {
  species: string;
  teethCondition?: string;
  eyeClarity?: string;
  muscleTone?: string;
  furCondition?: string;
}): AgeEstimate {
  // Simplified age estimation based on physical characteristics
  let minMonths = 12;
  let maxMonths = 60;
  let confidence = 40;

  if (features.teethCondition === 'baby') { minMonths = 0; maxMonths = 6; confidence = 70; }
  else if (features.teethCondition === 'clean') { minMonths = 6; maxMonths = 24; confidence = 60; }
  else if (features.teethCondition === 'worn') { minMonths = 60; maxMonths = 120; confidence = 50; }

  if (features.eyeClarity === 'clear') { confidence += 10; }
  else if (features.eyeClarity === 'cloudy') { minMonths = Math.max(minMonths, 84); confidence += 10; }

  if (features.muscleTone === 'lean') { maxMonths = Math.min(maxMonths, 36); }
  else if (features.muscleTone === 'soft') { minMonths = Math.max(minMonths, 48); }

  confidence = Math.min(90, confidence);

  const avgMonths = (minMonths + maxMonths) / 2;
  let category: AgeEstimate['category'];
  if (features.species === 'cat') {
    if (avgMonths < 6) category = 'kitten';
    else if (avgMonths < 24) category = 'young';
    else if (avgMonths < 84) category = 'adult';
    else category = 'senior';
  } else {
    if (avgMonths < 6) category = 'puppy';
    else if (avgMonths < 24) category = 'young';
    else if (avgMonths < 84) category = 'adult';
    else category = 'senior';
  }

  return { minMonths, maxMonths, category, confidence };
}
