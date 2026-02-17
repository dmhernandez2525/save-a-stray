// ── Donation Platform ────────────────────────────────────────
// Payment processing, recurring donations, sponsorships, campaigns, tax receipts

// ── Donation Types ──────────────────────────────────────────

export type DonationFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RecurringStatus = 'active' | 'paused' | 'cancelled' | 'expired';

export interface Donation {
  id: string;
  donorId: string;
  amount: number;         // cents
  currency: string;
  frequency: DonationFrequency;
  status: DonationStatus;
  campaignId?: string;
  animalId?: string;      // for sponsorships
  anonymous: boolean;
  message?: string;
  createdAt: string;
  stripePaymentIntentId?: string;
}

export interface RecurringDonation {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  frequency: DonationFrequency;
  status: RecurringStatus;
  startDate: string;
  nextChargeDate: string;
  lastChargeDate: string | null;
  totalCharged: number;
  chargeCount: number;
  stripeSubscriptionId?: string;
}

// ── Payment Processing ──────────────────────────────────────

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed';
  donorId: string;
  metadata: Record<string, string>;
}

export function createPaymentIntent(
  amount: number,
  currency: string,
  donorId: string,
  metadata: Record<string, string> = {}
): PaymentIntent {
  if (amount < 100) throw new Error('Minimum donation is $1.00');
  if (amount > 100000000) throw new Error('Maximum donation is $1,000,000');

  return {
    id: `pi_${Date.now()}`,
    amount,
    currency: currency.toLowerCase(),
    status: 'requires_payment',
    donorId,
    metadata,
  };
}

export function processPayment(intent: PaymentIntent): PaymentIntent {
  // Simulated processing
  return { ...intent, status: 'succeeded' };
}

export function refundPayment(intent: PaymentIntent): PaymentIntent {
  if (intent.status !== 'succeeded') throw new Error('Can only refund succeeded payments');
  return { ...intent, status: 'failed' };
}

export function formatAmount(cents: number, currency: string = 'usd'): string {
  const symbols: Record<string, string> = { usd: '$', eur: '\u20AC', gbp: '\u00A3', cad: 'CA$' };
  const symbol = symbols[currency.toLowerCase()] || '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

// ── Recurring Donation Management ───────────────────────────

export function createRecurringDonation(
  donorId: string,
  amount: number,
  frequency: DonationFrequency
): RecurringDonation {
  const now = new Date();
  const nextCharge = calculateNextChargeDate(now, frequency);

  return {
    id: `rec_${Date.now()}`,
    donorId,
    amount,
    currency: 'usd',
    frequency,
    status: 'active',
    startDate: now.toISOString(),
    nextChargeDate: nextCharge.toISOString(),
    lastChargeDate: null,
    totalCharged: 0,
    chargeCount: 0,
  };
}

function calculateNextChargeDate(from: Date, frequency: DonationFrequency): Date {
  const next = new Date(from);
  if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  else if (frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
  else if (frequency === 'annually') next.setFullYear(next.getFullYear() + 1);
  else next.setDate(next.getDate() + 30); // one-time fallback
  return next;
}

export function pauseRecurring(donation: RecurringDonation): RecurringDonation {
  if (donation.status !== 'active') throw new Error('Can only pause active subscriptions');
  return { ...donation, status: 'paused' };
}

export function resumeRecurring(donation: RecurringDonation): RecurringDonation {
  if (donation.status !== 'paused') throw new Error('Can only resume paused subscriptions');
  const next = calculateNextChargeDate(new Date(), donation.frequency);
  return { ...donation, status: 'active', nextChargeDate: next.toISOString() };
}

export function cancelRecurring(donation: RecurringDonation): RecurringDonation {
  return { ...donation, status: 'cancelled' };
}

export function modifyRecurringAmount(donation: RecurringDonation, newAmount: number): RecurringDonation {
  if (newAmount < 100) throw new Error('Minimum donation is $1.00');
  return { ...donation, amount: newAmount };
}

export function chargeRecurring(donation: RecurringDonation): RecurringDonation {
  const now = new Date();
  const next = calculateNextChargeDate(now, donation.frequency);
  return {
    ...donation,
    lastChargeDate: now.toISOString(),
    nextChargeDate: next.toISOString(),
    totalCharged: donation.totalCharged + donation.amount,
    chargeCount: donation.chargeCount + 1,
  };
}

// ── Animal Sponsorship ──────────────────────────────────────

export interface Sponsorship {
  id: string;
  donorId: string;
  animalId: string;
  animalName: string;
  monthlyAmount: number;
  status: RecurringStatus;
  startDate: string;
  totalContributed: number;
  updates: { date: string; message: string }[];
}

export function createSponsorship(
  donorId: string,
  animalId: string,
  animalName: string,
  monthlyAmount: number
): Sponsorship {
  return {
    id: `spon_${Date.now()}`,
    donorId,
    animalId,
    animalName,
    monthlyAmount,
    status: 'active',
    startDate: new Date().toISOString(),
    totalContributed: 0,
    updates: [],
  };
}

export function addSponsorshipUpdate(sponsorship: Sponsorship, message: string): Sponsorship {
  return {
    ...sponsorship,
    updates: [...sponsorship.updates, { date: new Date().toISOString(), message }],
  };
}

// ── Fundraising Campaigns ───────────────────────────────────

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;     // cents
  raisedAmount: number;
  donorCount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  imageUrl?: string;
}

export function createCampaign(data: Omit<Campaign, 'raisedAmount' | 'donorCount' | 'status'>): Campaign {
  return { ...data, raisedAmount: 0, donorCount: 0, status: 'draft' };
}

export function activateCampaign(campaign: Campaign): Campaign {
  return { ...campaign, status: 'active' };
}

export function recordCampaignDonation(campaign: Campaign, amount: number): Campaign {
  const raised = campaign.raisedAmount + amount;
  const status = raised >= campaign.goalAmount ? 'completed' : campaign.status;
  return { ...campaign, raisedAmount: raised, donorCount: campaign.donorCount + 1, status };
}

export function getCampaignProgress(campaign: Campaign): {
  percentComplete: number;
  remaining: number;
  isGoalMet: boolean;
} {
  const percent = campaign.goalAmount > 0
    ? Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
    : 0;
  return {
    percentComplete: percent,
    remaining: Math.max(0, campaign.goalAmount - campaign.raisedAmount),
    isGoalMet: campaign.raisedAmount >= campaign.goalAmount,
  };
}

// ── Donor Recognition Wall ──────────────────────────────────

export interface DonorRecognition {
  donorId: string;
  displayName: string;
  totalDonated: number;
  donationCount: number;
  anonymous: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  firstDonationDate: string;
}

export function getDonorTier(totalCents: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (totalCents >= 10000000) return 'platinum';   // $100,000+
  if (totalCents >= 1000000) return 'gold';         // $10,000+
  if (totalCents >= 100000) return 'silver';        // $1,000+
  return 'bronze';
}

export function buildRecognitionWall(
  donors: DonorRecognition[],
  showAnonymous: boolean = false
): DonorRecognition[] {
  const visible = showAnonymous ? donors : donors.filter(d => !d.anonymous);
  return [...visible].sort((a, b) => b.totalDonated - a.totalDonated);
}

// ── Tax Receipt Generation ──────────────────────────────────

export interface TaxReceipt {
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  organizationName: string;
  organizationEIN: string;
  donationDate: string;
  amount: number;
  currency: string;
  isGoodsOrServices: boolean;
  goodsOrServicesValue: number;
  deductibleAmount: number;
  year: number;
}

export function generateTaxReceipt(
  donor: { name: string; email: string },
  donation: { amount: number; currency: string; date: string },
  org: { name: string; ein: string }
): TaxReceipt {
  const date = new Date(donation.date);
  return {
    receiptNumber: `REC-${date.getFullYear()}-${Date.now().toString(36).toUpperCase()}`,
    donorName: donor.name,
    donorEmail: donor.email,
    organizationName: org.name,
    organizationEIN: org.ein,
    donationDate: donation.date,
    amount: donation.amount,
    currency: donation.currency,
    isGoodsOrServices: false,
    goodsOrServicesValue: 0,
    deductibleAmount: donation.amount,
    year: date.getFullYear(),
  };
}

export function generateYearEndSummary(
  donations: { amount: number; date: string }[],
  year: number
): { year: number; totalDonated: number; donationCount: number; months: Record<number, number> } {
  const yearDonations = donations.filter(d => new Date(d.date).getFullYear() === year);
  const months: Record<number, number> = {};

  for (const d of yearDonations) {
    const m = new Date(d.date).getMonth() + 1;
    months[m] = (months[m] || 0) + d.amount;
  }

  return {
    year,
    totalDonated: yearDonations.reduce((s, d) => s + d.amount, 0),
    donationCount: yearDonations.length,
    months,
  };
}

// ── Donation Analytics ──────────────────────────────────────

export interface DonationAnalytics {
  totalRaised: number;
  donorCount: number;
  averageGift: number;
  recurringDonors: number;
  retentionRate: number;
  lifetimeValue: number;
  topCampaigns: { id: string; title: string; raised: number }[];
}

export function calculateDonationAnalytics(
  donations: Donation[],
  recurringDonations: RecurringDonation[],
  campaigns: Campaign[]
): DonationAnalytics {
  const completed = donations.filter(d => d.status === 'completed');
  const totalRaised = completed.reduce((s, d) => s + d.amount, 0);
  const uniqueDonors = new Set(completed.map(d => d.donorId));
  const recurringDonors = recurringDonations.filter(r => r.status === 'active').length;

  const activeCampaigns = campaigns
    .filter(c => c.raisedAmount > 0)
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .slice(0, 5)
    .map(c => ({ id: c.id, title: c.title, raised: c.raisedAmount }));

  const donorCount = uniqueDonors.size;
  const averageGift = donorCount > 0 ? Math.round(totalRaised / completed.length) : 0;
  const retentionRate = donorCount > 0 ? Math.round((recurringDonors / donorCount) * 100) : 0;
  const lifetimeValue = donorCount > 0 ? Math.round(totalRaised / donorCount) : 0;

  return {
    totalRaised,
    donorCount,
    averageGift,
    recurringDonors,
    retentionRate,
    lifetimeValue,
    topCampaigns: activeCampaigns,
  };
}

// ── Donation-at-Adoption ────────────────────────────────────

export const SUGGESTED_AMOUNTS = [1000, 2500, 5000, 10000]; // cents

export function getSuggestedAmounts(animalType: string): { amount: number; label: string; impact: string }[] {
  const impacts: Record<string, string[]> = {
    dog: ['Covers one day of food', 'Covers vaccinations', 'Covers spay/neuter', 'Covers full medical care'],
    cat: ['Covers one week of food', 'Covers vaccinations', 'Covers spay/neuter', 'Covers full medical care'],
    default: ['Helps feed an animal', 'Covers basic care', 'Covers medical needs', 'Covers full rehabilitation'],
  };

  const impactList = impacts[animalType] || impacts.default;
  return SUGGESTED_AMOUNTS.map((amount, i) => ({
    amount,
    label: formatAmount(amount),
    impact: impactList[i],
  }));
}
