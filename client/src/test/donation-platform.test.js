import { describe, it, expect } from 'vitest';
import {
  createPaymentIntent, processPayment, refundPayment, formatAmount,
  createRecurringDonation, pauseRecurring, resumeRecurring, cancelRecurring,
  modifyRecurringAmount, chargeRecurring,
  createSponsorship, addSponsorshipUpdate,
  createCampaign, activateCampaign, recordCampaignDonation, getCampaignProgress,
  getDonorTier, buildRecognitionWall,
  generateTaxReceipt, generateYearEndSummary,
  calculateDonationAnalytics,
  SUGGESTED_AMOUNTS, getSuggestedAmounts,
} from '../lib/donation-platform';

describe('Donation Platform', () => {

  describe('Payment Processing', () => {
    it('should create a payment intent', () => {
      const pi = createPaymentIntent(5000, 'usd', 'donor1');
      expect(pi.amount).toBe(5000);
      expect(pi.status).toBe('requires_payment');
    });

    it('should reject amounts below minimum', () => {
      expect(() => createPaymentIntent(50, 'usd', 'donor1')).toThrow('Minimum');
    });

    it('should reject amounts above maximum', () => {
      expect(() => createPaymentIntent(200000000, 'usd', 'donor1')).toThrow('Maximum');
    });

    it('should process payment', () => {
      const pi = createPaymentIntent(5000, 'usd', 'donor1');
      const result = processPayment(pi);
      expect(result.status).toBe('succeeded');
    });

    it('should refund succeeded payment', () => {
      const pi = processPayment(createPaymentIntent(5000, 'usd', 'donor1'));
      const refund = refundPayment(pi);
      expect(refund.status).toBe('requires_payment');
    });

    it('should not refund non-succeeded payment', () => {
      const pi = createPaymentIntent(5000, 'usd', 'donor1');
      expect(() => refundPayment(pi)).toThrow('only refund');
    });

    it('should format amounts', () => {
      expect(formatAmount(5000)).toBe('$50.00');
      expect(formatAmount(1099, 'eur')).toBe('\u20AC10.99');
      expect(formatAmount(2500, 'gbp')).toBe('\u00A325.00');
    });
  });

  describe('Recurring Donations', () => {
    it('should create recurring donation', () => {
      const rec = createRecurringDonation('donor1', 2500, 'monthly');
      expect(rec.status).toBe('active');
      expect(rec.frequency).toBe('monthly');
      expect(rec.chargeCount).toBe(0);
    });

    it('should pause active donation', () => {
      const rec = createRecurringDonation('donor1', 2500, 'monthly');
      const paused = pauseRecurring(rec);
      expect(paused.status).toBe('paused');
    });

    it('should resume paused donation', () => {
      const rec = pauseRecurring(createRecurringDonation('donor1', 2500, 'monthly'));
      const resumed = resumeRecurring(rec);
      expect(resumed.status).toBe('active');
    });

    it('should not pause non-active donation', () => {
      const rec = cancelRecurring(createRecurringDonation('donor1', 2500, 'monthly'));
      expect(() => pauseRecurring(rec)).toThrow();
    });

    it('should cancel donation', () => {
      const rec = createRecurringDonation('donor1', 2500, 'monthly');
      expect(cancelRecurring(rec).status).toBe('cancelled');
    });

    it('should modify amount', () => {
      const rec = createRecurringDonation('donor1', 2500, 'monthly');
      const modified = modifyRecurringAmount(rec, 5000);
      expect(modified.amount).toBe(5000);
    });

    it('should reject amount below minimum', () => {
      const rec = createRecurringDonation('donor1', 2500, 'monthly');
      expect(() => modifyRecurringAmount(rec, 50)).toThrow('Minimum');
    });

    it('should charge and update counters', () => {
      const rec = createRecurringDonation('donor1', 2500, 'monthly');
      const charged = chargeRecurring(rec);
      expect(charged.chargeCount).toBe(1);
      expect(charged.totalCharged).toBe(2500);
      expect(charged.lastChargeDate).toBeTruthy();
    });
  });

  describe('Animal Sponsorship', () => {
    it('should create sponsorship', () => {
      const spon = createSponsorship('donor1', 'animal1', 'Buddy', 2500);
      expect(spon.status).toBe('active');
      expect(spon.animalName).toBe('Buddy');
      expect(spon.totalContributed).toBe(0);
    });

    it('should add updates', () => {
      const spon = createSponsorship('donor1', 'animal1', 'Buddy', 2500);
      const updated = addSponsorshipUpdate(spon, 'Buddy is doing great!');
      expect(updated.updates).toHaveLength(1);
      expect(updated.updates[0].message).toContain('Buddy');
    });
  });

  describe('Fundraising Campaigns', () => {
    it('should create campaign in draft status', () => {
      const campaign = createCampaign({
        id: 'c1', title: 'Winter Fund', description: 'Help keep animals warm',
        goalAmount: 1000000, startDate: '2026-01-01', endDate: '2026-03-01',
      });
      expect(campaign.status).toBe('draft');
      expect(campaign.raisedAmount).toBe(0);
    });

    it('should activate campaign', () => {
      const campaign = activateCampaign(createCampaign({
        id: 'c1', title: 'Winter Fund', description: '',
        goalAmount: 1000000, startDate: '2026-01-01', endDate: '2026-03-01',
      }));
      expect(campaign.status).toBe('active');
    });

    it('should record donations and increment donor count', () => {
      let campaign = activateCampaign(createCampaign({
        id: 'c1', title: 'Winter Fund', description: '',
        goalAmount: 1000000, startDate: '2026-01-01', endDate: '2026-03-01',
      }));
      campaign = recordCampaignDonation(campaign, 50000);
      expect(campaign.raisedAmount).toBe(50000);
      expect(campaign.donorCount).toBe(1);
    });

    it('should auto-complete when goal met', () => {
      let campaign = activateCampaign(createCampaign({
        id: 'c1', title: 'Fund', description: '', goalAmount: 10000,
        startDate: '2026-01-01', endDate: '2026-12-31',
      }));
      campaign = recordCampaignDonation(campaign, 10000);
      expect(campaign.status).toBe('completed');
    });

    it('should calculate progress', () => {
      let campaign = activateCampaign(createCampaign({
        id: 'c1', title: 'Fund', description: '', goalAmount: 100000,
        startDate: '2026-01-01', endDate: '2026-12-31',
      }));
      campaign = recordCampaignDonation(campaign, 50000);
      const progress = getCampaignProgress(campaign);
      expect(progress.percentComplete).toBe(50);
      expect(progress.remaining).toBe(50000);
      expect(progress.isGoalMet).toBe(false);
    });
  });

  describe('Donor Recognition', () => {
    it('should assign tiers correctly', () => {
      expect(getDonorTier(50000)).toBe('bronze');
      expect(getDonorTier(100000)).toBe('silver');
      expect(getDonorTier(1000000)).toBe('gold');
      expect(getDonorTier(10000000)).toBe('platinum');
    });

    it('should build recognition wall sorted by total', () => {
      const donors = [
        { donorId: 'd1', displayName: 'Alice', totalDonated: 50000, donationCount: 5, anonymous: false, tier: 'bronze', firstDonationDate: '2025-01-01' },
        { donorId: 'd2', displayName: 'Bob', totalDonated: 200000, donationCount: 10, anonymous: false, tier: 'silver', firstDonationDate: '2025-02-01' },
      ];
      const wall = buildRecognitionWall(donors);
      expect(wall[0].donorId).toBe('d2');
    });

    it('should hide anonymous donors by default', () => {
      const donors = [
        { donorId: 'd1', displayName: 'Alice', totalDonated: 50000, donationCount: 5, anonymous: true, tier: 'bronze', firstDonationDate: '2025-01-01' },
        { donorId: 'd2', displayName: 'Bob', totalDonated: 200000, donationCount: 10, anonymous: false, tier: 'silver', firstDonationDate: '2025-02-01' },
      ];
      const wall = buildRecognitionWall(donors);
      expect(wall).toHaveLength(1);
      expect(wall[0].donorId).toBe('d2');
    });

    it('should show anonymous donors when requested', () => {
      const donors = [
        { donorId: 'd1', displayName: 'Anonymous', totalDonated: 50000, donationCount: 5, anonymous: true, tier: 'bronze', firstDonationDate: '2025-01-01' },
      ];
      const wall = buildRecognitionWall(donors, true);
      expect(wall).toHaveLength(1);
    });
  });

  describe('Tax Receipts', () => {
    it('should generate tax receipt with required fields', () => {
      const receipt = generateTaxReceipt(
        { name: 'Jane Doe', email: 'jane@example.com' },
        { amount: 10000, currency: 'usd', date: '2026-06-15T00:00:00Z' },
        { name: 'Save A Stray', ein: '12-3456789' }
      );
      expect(receipt.receiptNumber).toBeTruthy();
      expect(receipt.donorName).toBe('Jane Doe');
      expect(receipt.organizationEIN).toBe('12-3456789');
      expect(receipt.deductibleAmount).toBe(10000);
      expect(receipt.year).toBe(2026);
    });

    it('should generate year-end summary', () => {
      const donations = [
        { amount: 5000, date: '2026-01-15T00:00:00Z' },
        { amount: 3000, date: '2026-01-20T00:00:00Z' },
        { amount: 7000, date: '2026-06-10T00:00:00Z' },
        { amount: 2000, date: '2025-12-01T00:00:00Z' }, // different year
      ];
      const summary = generateYearEndSummary(donations, 2026);
      expect(summary.year).toBe(2026);
      expect(summary.donationCount).toBe(3);
      expect(summary.totalDonated).toBe(15000);
      expect(summary.months[1]).toBe(8000);
      expect(summary.months[6]).toBe(7000);
    });
  });

  describe('Donation Analytics', () => {
    it('should calculate analytics', () => {
      const donations = [
        { id: 'd1', donorId: 'donor1', amount: 5000, currency: 'usd', frequency: 'one-time', status: 'completed', anonymous: false, createdAt: '2026-01-01' },
        { id: 'd2', donorId: 'donor2', amount: 10000, currency: 'usd', frequency: 'one-time', status: 'completed', anonymous: false, createdAt: '2026-02-01' },
        { id: 'd3', donorId: 'donor1', amount: 2500, currency: 'usd', frequency: 'one-time', status: 'failed', anonymous: false, createdAt: '2026-03-01' },
      ];
      const recurring = [
        { id: 'r1', donorId: 'donor1', amount: 2500, currency: 'usd', frequency: 'monthly', status: 'active', startDate: '2026-01-01', nextChargeDate: '2026-02-01', lastChargeDate: null, totalCharged: 0, chargeCount: 0 },
      ];
      const campaigns = [
        { id: 'c1', title: 'Camp 1', description: '', goalAmount: 100000, raisedAmount: 50000, donorCount: 10, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
      ];
      const analytics = calculateDonationAnalytics(donations, recurring, campaigns);
      expect(analytics.totalRaised).toBe(15000);
      expect(analytics.donorCount).toBe(2);
      expect(analytics.recurringDonors).toBe(1);
      expect(analytics.topCampaigns).toHaveLength(1);
      expect(analytics.averageGift).toBeGreaterThan(0);
    });
  });

  describe('Donation at Adoption', () => {
    it('should define 4 suggested amounts', () => {
      expect(SUGGESTED_AMOUNTS).toHaveLength(4);
    });

    it('should return impact messaging for dogs', () => {
      const suggestions = getSuggestedAmounts('dog');
      expect(suggestions).toHaveLength(4);
      suggestions.forEach(s => {
        expect(s.label).toBeTruthy();
        expect(s.impact).toBeTruthy();
      });
    });

    it('should return impact messaging for cats', () => {
      const suggestions = getSuggestedAmounts('cat');
      expect(suggestions[0].impact).toContain('food');
    });

    it('should fallback for unknown animal types', () => {
      const suggestions = getSuggestedAmounts('rabbit');
      expect(suggestions).toHaveLength(4);
    });
  });
});
