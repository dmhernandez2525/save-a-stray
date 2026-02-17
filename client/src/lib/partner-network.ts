// ── Partner Network System ───────────────────────────────────
// Vet partners, pet stores, rescue orgs, transport, shared resources

// ── Partner Types ───────────────────────────────────────────

export type PartnerType = 'veterinary' | 'pet-store' | 'rescue' | 'transport' | 'foster-network' | 'corporate';
export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  description: string;
  services: string[];
  joinedAt: string;
  agreementSignedAt?: string;
}

// ── Partner Onboarding ──────────────────────────────────────

export type OnboardingStep = 'application' | 'review' | 'agreement' | 'profile-setup' | 'integration' | 'complete';

export interface OnboardingProgress {
  partnerId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  startedAt: string;
  completedAt?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = ['application', 'review', 'agreement', 'profile-setup', 'integration', 'complete'];

export function createOnboarding(partnerId: string): OnboardingProgress {
  return {
    partnerId,
    currentStep: 'application',
    completedSteps: [],
    startedAt: new Date().toISOString(),
  };
}

export function advanceOnboarding(progress: OnboardingProgress): OnboardingProgress {
  const idx = ONBOARDING_STEPS.indexOf(progress.currentStep);
  if (idx === -1 || idx >= ONBOARDING_STEPS.length - 1) return progress;

  const next = ONBOARDING_STEPS[idx + 1];
  const completed = [...progress.completedSteps, progress.currentStep];

  return {
    ...progress,
    currentStep: next,
    completedSteps: completed,
    completedAt: next === 'complete' ? new Date().toISOString() : undefined,
  };
}

export function getOnboardingPercentage(progress: OnboardingProgress): number {
  return Math.round((progress.completedSteps.length / ONBOARDING_STEPS.length) * 100);
}

export function isOnboardingComplete(progress: OnboardingProgress): boolean {
  return progress.currentStep === 'complete';
}

// ── Veterinary Partners ─────────────────────────────────────

export interface VetClinic extends Partner {
  type: 'veterinary';
  specializations: string[];
  acceptsEmergency: boolean;
  operatingHours: { day: string; open: string; close: string }[];
  discountPercentage: number;   // discount for shelter animals
}

export interface VetAppointment {
  id: string;
  clinicId: string;
  animalId: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export function scheduleAppointment(
  clinicId: string,
  animalId: string,
  date: string,
  time: string,
  reason: string
): VetAppointment {
  return {
    id: `apt_${Date.now()}`,
    clinicId,
    animalId,
    date,
    time,
    reason,
    status: 'scheduled',
  };
}

export function confirmAppointment(apt: VetAppointment): VetAppointment {
  return { ...apt, status: 'confirmed' };
}

export function cancelAppointment(apt: VetAppointment): VetAppointment {
  return { ...apt, status: 'cancelled' };
}

// ── Animal Transfers ────────────────────────────────────────

export type TransferStatus = 'requested' | 'approved' | 'in-transit' | 'completed' | 'cancelled';

export interface AnimalTransfer {
  id: string;
  animalId: string;
  fromOrganizationId: string;
  toOrganizationId: string;
  status: TransferStatus;
  reason: string;
  requestedAt: string;
  completedAt?: string;
  transportId?: string;
  healthCertificateId?: string;
}

export function requestTransfer(
  animalId: string,
  fromOrgId: string,
  toOrgId: string,
  reason: string
): AnimalTransfer {
  return {
    id: `xfer_${Date.now()}`,
    animalId,
    fromOrganizationId: fromOrgId,
    toOrganizationId: toOrgId,
    status: 'requested',
    reason,
    requestedAt: new Date().toISOString(),
  };
}

export function approveTransfer(transfer: AnimalTransfer): AnimalTransfer {
  return { ...transfer, status: 'approved' };
}

export function completeTransfer(transfer: AnimalTransfer): AnimalTransfer {
  return { ...transfer, status: 'completed', completedAt: new Date().toISOString() };
}

export function cancelTransfer(transfer: AnimalTransfer): AnimalTransfer {
  return { ...transfer, status: 'cancelled' };
}

// ── Transport Coordination ──────────────────────────────────

export interface TransportRoute {
  id: string;
  origin: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  distanceKm: number;
  estimatedMinutes: number;
  driverId?: string;
  animalIds: string[];
  date: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
}

export function createTransportRoute(
  origin: TransportRoute['origin'],
  destination: TransportRoute['destination'],
  animalIds: string[],
  date: string
): TransportRoute {
  // Simplified distance estimation
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const distanceKm = Math.round(Math.sqrt(dLat ** 2 + dLng ** 2) * 111);  // rough km
  const estimatedMinutes = Math.round(distanceKm * 1.2); // ~50 km/h average

  return {
    id: `route_${Date.now()}`,
    origin,
    destination,
    distanceKm,
    estimatedMinutes,
    animalIds,
    date,
    status: 'planned',
  };
}

export function assignDriver(route: TransportRoute, driverId: string): TransportRoute {
  return { ...route, driverId };
}

export function startTransport(route: TransportRoute): TransportRoute {
  return { ...route, status: 'in-progress' };
}

export function completeTransport(route: TransportRoute): TransportRoute {
  return { ...route, status: 'completed' };
}

// ── Shared Resource Pool ────────────────────────────────────

export type ResourceType = 'foster-home' | 'supplies' | 'equipment' | 'space' | 'volunteer';

export interface SharedResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  ownerId: string;          // partner/org ID
  available: boolean;
  quantity: number;
  location: string;
}

export function listAvailableResources(resources: SharedResource[], type?: ResourceType): SharedResource[] {
  return resources.filter(r => r.available && r.quantity > 0 && (!type || r.type === type));
}

export function requestResource(resource: SharedResource, quantity: number): {
  success: boolean;
  remaining: number;
  reason?: string;
} {
  if (!resource.available) return { success: false, remaining: resource.quantity, reason: 'Resource not available' };
  if (quantity > resource.quantity) return { success: false, remaining: resource.quantity, reason: 'Insufficient quantity' };
  return { success: true, remaining: resource.quantity - quantity };
}

// ── Partner Search & Directory ──────────────────────────────

export function searchPartners(
  partners: Partner[],
  query: string,
  type?: PartnerType
): Partner[] {
  const q = query.toLowerCase();
  return partners.filter(p => {
    if (p.status !== 'active') return false;
    if (type && p.type !== type) return false;
    return p.name.toLowerCase().includes(q) ||
           p.city.toLowerCase().includes(q) ||
           p.description.toLowerCase().includes(q) ||
           p.services.some(s => s.toLowerCase().includes(q));
  });
}

export function getPartnersByType(partners: Partner[], type: PartnerType): Partner[] {
  return partners.filter(p => p.type === type && p.status === 'active');
}

// ── Partner Communication ───────────────────────────────────

export interface PartnerMessage {
  id: string;
  fromPartnerId: string;
  toPartnerId: string;
  subject: string;
  body: string;
  sentAt: string;
  readAt?: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  body: string;
  targetTypes: PartnerType[];
  publishedAt: string;
  expiresAt?: string;
}

export function createMessage(from: string, to: string, subject: string, body: string): PartnerMessage {
  return {
    id: `msg_${Date.now()}`,
    fromPartnerId: from,
    toPartnerId: to,
    subject,
    body,
    sentAt: new Date().toISOString(),
  };
}

export function createAnnouncement(
  authorId: string,
  title: string,
  body: string,
  targetTypes: PartnerType[]
): Announcement {
  return {
    id: `ann_${Date.now()}`,
    authorId,
    title,
    body,
    targetTypes,
    publishedAt: new Date().toISOString(),
  };
}

export function getAnnouncementsForPartner(
  announcements: Announcement[],
  partnerType: PartnerType
): Announcement[] {
  const now = new Date();
  return announcements.filter(a =>
    a.targetTypes.includes(partnerType) &&
    (!a.expiresAt || new Date(a.expiresAt) > now)
  );
}

// ── Partner Analytics ───────────────────────────────────────

export interface PartnerAnalytics {
  totalPartners: number;
  activePartners: number;
  partnersByType: Record<string, number>;
  totalTransfers: number;
  totalAppointments: number;
  collaborationScore: number;
}

export function calculatePartnerAnalytics(
  partners: Partner[],
  transfers: AnimalTransfer[],
  appointments: VetAppointment[]
): PartnerAnalytics {
  const active = partners.filter(p => p.status === 'active');
  const byType: Record<string, number> = {};
  for (const p of active) {
    byType[p.type] = (byType[p.type] || 0) + 1;
  }

  const completedTransfers = transfers.filter(t => t.status === 'completed').length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;

  // Simple collaboration score based on activity
  const collaborationScore = Math.min(100, Math.round(
    (completedTransfers * 10 + completedAppts * 5) / Math.max(1, active.length)
  ));

  return {
    totalPartners: partners.length,
    activePartners: active.length,
    partnersByType: byType,
    totalTransfers: completedTransfers,
    totalAppointments: completedAppts,
    collaborationScore,
  };
}
