// ── Lost & Found Integration ────────────────────────────────
// Reporting, matching, alerts, microchip lookup, flyer generation, analytics

// ── Report Types ────────────────────────────────────────────

export type ReportType = 'lost' | 'found';
export type ReportStatus = 'active' | 'matched' | 'reunited' | 'closed';

export interface LostFoundReport {
  id: string;
  type: ReportType;
  status: ReportStatus;
  petName?: string;
  species: string;
  breed?: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  gender?: 'male' | 'female' | 'unknown';
  description: string;
  distinguishingFeatures: string;
  photoUrls: string[];
  location: { lat: number; lng: number; address: string };
  date: string;                 // date lost or found
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  microchipId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Report Creation & Validation ────────────────────────────

const REQUIRED_REPORT_FIELDS: (keyof LostFoundReport)[] = [
  'type', 'species', 'color', 'size', 'description', 'location', 'date', 'contactName', 'contactPhone',
];

export function validateReport(data: Partial<LostFoundReport>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of REQUIRED_REPORT_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`${field} is required`);
    }
  }

  if (data.location) {
    if (typeof data.location.lat !== 'number' || typeof data.location.lng !== 'number') {
      errors.push('Location must have valid lat/lng coordinates');
    }
  }

  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.push('Invalid email format');
  }

  return { valid: errors.length === 0, errors };
}

export function createReport(data: Omit<LostFoundReport, 'id' | 'status' | 'createdAt' | 'updatedAt'>): LostFoundReport {
  const now = new Date().toISOString();
  return {
    ...data,
    id: `rpt_${Date.now()}`,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function updateReportStatus(report: LostFoundReport, status: ReportStatus): LostFoundReport {
  return { ...report, status, updatedAt: new Date().toISOString() };
}

// ── Location-Based Matching ─────────────────────────────────

export function calculateDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  // Haversine formula (returns kilometers)
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export interface MatchResult {
  reportId: string;
  matchedReportId: string;
  score: number;          // 0-100
  distance: number;       // km
  matchReasons: string[];
}

export function findMatches(
  report: LostFoundReport,
  candidates: LostFoundReport[],
  radiusKm: number = 25
): MatchResult[] {
  const oppositeType = report.type === 'lost' ? 'found' : 'lost';

  return candidates
    .filter(c => c.type === oppositeType && c.status === 'active' && c.species === report.species)
    .map(candidate => {
      const distance = calculateDistance(
        report.location.lat, report.location.lng,
        candidate.location.lat, candidate.location.lng
      );

      if (distance > radiusKm) return null;

      let score = 0;
      const reasons: string[] = [];

      // Location proximity (max 30 points)
      const proxScore = Math.max(0, 30 - (distance / radiusKm) * 30);
      score += proxScore;
      if (distance < 5) reasons.push('Very close location');

      // Species match already filtered (10 points)
      score += 10;
      reasons.push('Same species');

      // Color match (20 points)
      if (report.color.toLowerCase() === candidate.color.toLowerCase()) {
        score += 20;
        reasons.push('Color match');
      }

      // Size match (15 points)
      if (report.size === candidate.size) {
        score += 15;
        reasons.push('Size match');
      }

      // Breed match (15 points)
      if (report.breed && candidate.breed &&
          report.breed.toLowerCase() === candidate.breed.toLowerCase()) {
        score += 15;
        reasons.push('Breed match');
      }

      // Gender match (5 points)
      if (report.gender && candidate.gender &&
          report.gender === candidate.gender && report.gender !== 'unknown') {
        score += 5;
        reasons.push('Gender match');
      }

      // Microchip match (instant 100)
      if (report.microchipId && candidate.microchipId &&
          report.microchipId === candidate.microchipId) {
        score = 100;
        reasons.length = 0;
        reasons.push('Microchip ID match');
      }

      return {
        reportId: report.id,
        matchedReportId: candidate.id,
        score: Math.min(100, Math.round(score)),
        distance,
        matchReasons: reasons,
      };
    })
    .filter((m): m is MatchResult => m !== null)
    .sort((a, b) => b.score - a.score);
}

// ── Search Alerts ───────────────────────────────────────────

export interface SearchAlert {
  id: string;
  reportId: string;
  userId: string;
  radiusKm: number;
  active: boolean;
  createdAt: string;
  lastNotifiedAt: string | null;
}

export function createSearchAlert(reportId: string, userId: string, radiusKm: number = 25): SearchAlert {
  return {
    id: `alert_${Date.now()}`,
    reportId,
    userId,
    radiusKm,
    active: true,
    createdAt: new Date().toISOString(),
    lastNotifiedAt: null,
  };
}

export function deactivateAlert(alert: SearchAlert): SearchAlert {
  return { ...alert, active: false };
}

export function shouldTriggerAlert(
  alert: SearchAlert,
  newReport: LostFoundReport,
  originalReport: LostFoundReport
): boolean {
  if (!alert.active) return false;
  if (newReport.type === originalReport.type) return false; // same type won't match
  if (newReport.species !== originalReport.species) return false;

  const distance = calculateDistance(
    originalReport.location.lat, originalReport.location.lng,
    newReport.location.lat, newReport.location.lng
  );
  return distance <= alert.radiusKm;
}

// ── Microchip Lookup ────────────────────────────────────────

export interface MicrochipRecord {
  chipId: string;
  registry: string;
  petName: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  registeredAt: string;
}

export const MICROCHIP_REGISTRIES = ['AKC Reunite', 'Found Animals', 'AAHA', 'HomeAgain', 'PetLink'];

export function lookupMicrochip(
  chipId: string,
  database: MicrochipRecord[]
): MicrochipRecord | null {
  return database.find(r => r.chipId === chipId) || null;
}

// ── Flyer Generator ─────────────────────────────────────────

export interface FlyerData {
  title: string;
  petName: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  description: string;
  distinguishingFeatures: string;
  lastSeenDate: string;
  lastSeenLocation: string;
  contactName: string;
  contactPhone: string;
  photoUrl?: string;
  reward?: string;
}

export function generateFlyerData(report: LostFoundReport, reward?: string): FlyerData {
  const title = report.type === 'lost' ? 'LOST PET' : 'FOUND PET';
  return {
    title,
    petName: report.petName || 'Unknown',
    species: report.species,
    breed: report.breed || 'Unknown',
    color: report.color,
    size: report.size,
    description: report.description,
    distinguishingFeatures: report.distinguishingFeatures,
    lastSeenDate: report.date,
    lastSeenLocation: report.location.address,
    contactName: report.contactName,
    contactPhone: report.contactPhone,
    photoUrl: report.photoUrls[0],
    reward,
  };
}

export function generateFlyerHtml(data: FlyerData): string {
  return [
    `<div class="flyer">`,
    `<h1>${data.title}</h1>`,
    data.photoUrl ? `<img src="${data.photoUrl}" alt="${data.petName}" />` : '',
    `<h2>${data.petName}</h2>`,
    `<p><strong>Species:</strong> ${data.species}</p>`,
    `<p><strong>Breed:</strong> ${data.breed}</p>`,
    `<p><strong>Color:</strong> ${data.color}</p>`,
    `<p><strong>Size:</strong> ${data.size}</p>`,
    `<p><strong>Description:</strong> ${data.description}</p>`,
    data.distinguishingFeatures ? `<p><strong>Distinguishing Features:</strong> ${data.distinguishingFeatures}</p>` : '',
    `<p><strong>Last Seen:</strong> ${data.lastSeenDate} at ${data.lastSeenLocation}</p>`,
    `<p><strong>Contact:</strong> ${data.contactName} - ${data.contactPhone}</p>`,
    data.reward ? `<p class="reward"><strong>REWARD: ${data.reward}</strong></p>` : '',
    `</div>`,
  ].filter(Boolean).join('\n');
}

// ── Reunification Tracking ──────────────────────────────────

export interface Reunification {
  id: string;
  lostReportId: string;
  foundReportId: string;
  reunifiedAt: string;
  method: 'platform-match' | 'microchip' | 'community-alert' | 'shelter-intake' | 'other';
  notes: string;
  daysToReunify: number;
}

export function recordReunification(
  lostReport: LostFoundReport,
  foundReport: LostFoundReport,
  method: Reunification['method'],
  notes: string = ''
): Reunification {
  const lostDate = new Date(lostReport.date);
  const now = new Date();
  const daysToReunify = Math.round((now.getTime() - lostDate.getTime()) / 86400000);

  return {
    id: `reunite_${Date.now()}`,
    lostReportId: lostReport.id,
    foundReportId: foundReport.id,
    reunifiedAt: now.toISOString(),
    method,
    notes,
    daysToReunify,
  };
}

// ── Lost & Found Analytics ──────────────────────────────────

export interface LostFoundAnalytics {
  totalLostReports: number;
  totalFoundReports: number;
  activeReports: number;
  reunifiedCount: number;
  matchRate: number;
  averageDaysToReunify: number;
  reportsBySpecies: Record<string, number>;
}

export function calculateLostFoundAnalytics(
  reports: LostFoundReport[],
  reunifications: Reunification[]
): LostFoundAnalytics {
  const lost = reports.filter(r => r.type === 'lost');
  const found = reports.filter(r => r.type === 'found');
  const active = reports.filter(r => r.status === 'active');

  const totalReunified = reunifications.length;
  const avgDays = totalReunified > 0
    ? Math.round(reunifications.reduce((s, r) => s + r.daysToReunify, 0) / totalReunified)
    : 0;

  const matchRate = lost.length > 0 ? Math.round((totalReunified / lost.length) * 100) : 0;

  const bySpecies: Record<string, number> = {};
  for (const r of reports) {
    bySpecies[r.species] = (bySpecies[r.species] || 0) + 1;
  }

  return {
    totalLostReports: lost.length,
    totalFoundReports: found.length,
    activeReports: active.length,
    reunifiedCount: totalReunified,
    matchRate,
    averageDaysToReunify: avgDays,
    reportsBySpecies: bySpecies,
  };
}
