import { describe, it, expect } from 'vitest';
import {
  validateReport, createReport, updateReportStatus,
  calculateDistance, findMatches,
  createSearchAlert, deactivateAlert, shouldTriggerAlert,
  MICROCHIP_REGISTRIES, lookupMicrochip,
  generateFlyerData, generateFlyerHtml,
  recordReunification,
  calculateLostFoundAnalytics,
} from '../lib/lost-found';

const baseLostReport = {
  type: 'lost',
  petName: 'Buddy',
  species: 'dog',
  breed: 'Labrador',
  color: 'golden',
  size: 'large',
  gender: 'male',
  description: 'Friendly golden Labrador wearing a red collar',
  distinguishingFeatures: 'Scar on left ear',
  photoUrls: ['https://example.com/buddy.jpg'],
  location: { lat: 40.7128, lng: -74.006, address: '123 Main St, New York' },
  date: '2026-02-10',
  contactName: 'Jane Doe',
  contactPhone: '555-1234',
  contactEmail: 'jane@example.com',
};

describe('Lost & Found', () => {

  describe('Report Validation', () => {
    it('should accept valid report', () => {
      const result = validateReport(baseLostReport);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const result = validateReport({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid email', () => {
      const result = validateReport({ ...baseLostReport, contactEmail: 'bad' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should create report with active status', () => {
      const report = createReport(baseLostReport);
      expect(report.status).toBe('active');
      expect(report.id).toBeTruthy();
      expect(report.createdAt).toBeTruthy();
    });

    it('should update report status', () => {
      const report = createReport(baseLostReport);
      const updated = updateReportStatus(report, 'reunited');
      expect(updated.status).toBe('reunited');
    });
  });

  describe('Location Matching', () => {
    it('should calculate distance between coordinates', () => {
      // NYC to Boston ~ 306 km
      const dist = calculateDistance(40.7128, -74.006, 42.3601, -71.0589);
      expect(dist).toBeGreaterThan(290);
      expect(dist).toBeLessThan(320);
    });

    it('should return 0 for same coordinates', () => {
      const dist = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(dist).toBe(0);
    });

    it('should find matches for opposite report types', () => {
      const lost = createReport(baseLostReport);
      const found = createReport({
        ...baseLostReport,
        type: 'found',
        petName: undefined,
        location: { lat: 40.72, lng: -74.00, address: 'Nearby' },
      });
      const matches = findMatches(lost, [found]);
      expect(matches.length).toBe(1);
      expect(matches[0].score).toBeGreaterThan(0);
    });

    it('should not match same report type', () => {
      const lost1 = createReport(baseLostReport);
      const lost2 = createReport({ ...baseLostReport, location: { lat: 40.72, lng: -74.00, address: 'Nearby' } });
      expect(findMatches(lost1, [lost2])).toHaveLength(0);
    });

    it('should not match different species', () => {
      const lost = createReport(baseLostReport);
      const found = createReport({
        ...baseLostReport,
        type: 'found',
        species: 'cat',
        location: { lat: 40.72, lng: -74.00, address: 'Nearby' },
      });
      expect(findMatches(lost, [found])).toHaveLength(0);
    });

    it('should exclude matches outside radius', () => {
      const lost = createReport(baseLostReport);
      const farFound = createReport({
        ...baseLostReport,
        type: 'found',
        location: { lat: 42.36, lng: -71.06, address: 'Boston' }, // ~300km away
      });
      expect(findMatches(lost, [farFound], 25)).toHaveLength(0);
    });

    it('should score microchip match as 100', () => {
      const lost = createReport({ ...baseLostReport, microchipId: 'CHIP123' });
      const found = createReport({
        ...baseLostReport,
        type: 'found',
        microchipId: 'CHIP123',
        location: { lat: 40.72, lng: -74.00, address: 'Nearby' },
      });
      const matches = findMatches(lost, [found]);
      expect(matches[0].score).toBe(100);
      expect(matches[0].matchReasons).toContain('Microchip ID match');
    });

    it('should sort matches by score descending', () => {
      const lost = createReport(baseLostReport);
      const goodMatch = createReport({
        ...baseLostReport,
        type: 'found',
        location: { lat: 40.713, lng: -74.006, address: 'Very close' },
      });
      const weakMatch = createReport({
        ...baseLostReport,
        type: 'found',
        color: 'black',
        size: 'small',
        breed: undefined,
        location: { lat: 40.75, lng: -73.98, address: 'Farther' },
      });
      const matches = findMatches(lost, [goodMatch, weakMatch]);
      expect(matches.length).toBe(2);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
    });
  });

  describe('Search Alerts', () => {
    it('should create alert', () => {
      const alert = createSearchAlert('rpt_1', 'user1', 10);
      expect(alert.active).toBe(true);
      expect(alert.radiusKm).toBe(10);
    });

    it('should deactivate alert', () => {
      const alert = createSearchAlert('rpt_1', 'user1');
      const inactive = deactivateAlert(alert);
      expect(inactive.active).toBe(false);
    });

    it('should trigger alert for nearby opposite-type report', () => {
      const lost = createReport(baseLostReport);
      const alert = createSearchAlert(lost.id, 'user1', 25);
      const found = createReport({
        ...baseLostReport,
        type: 'found',
        location: { lat: 40.72, lng: -74.00, address: 'Nearby' },
      });
      expect(shouldTriggerAlert(alert, found, lost)).toBe(true);
    });

    it('should not trigger for inactive alert', () => {
      const lost = createReport(baseLostReport);
      const alert = deactivateAlert(createSearchAlert(lost.id, 'user1', 25));
      const found = createReport({
        ...baseLostReport, type: 'found',
        location: { lat: 40.72, lng: -74.00, address: 'Nearby' },
      });
      expect(shouldTriggerAlert(alert, found, lost)).toBe(false);
    });

    it('should not trigger for same report type', () => {
      const lost = createReport(baseLostReport);
      const alert = createSearchAlert(lost.id, 'user1', 25);
      const anotherLost = createReport({
        ...baseLostReport,
        location: { lat: 40.72, lng: -74.00, address: 'Nearby' },
      });
      expect(shouldTriggerAlert(alert, anotherLost, lost)).toBe(false);
    });
  });

  describe('Microchip Lookup', () => {
    it('should define at least 5 registries', () => {
      expect(MICROCHIP_REGISTRIES.length).toBeGreaterThanOrEqual(5);
    });

    it('should find chip in database', () => {
      const db = [
        { chipId: 'CHIP123', registry: 'AKC Reunite', petName: 'Buddy', species: 'dog', breed: 'Lab', ownerName: 'Jane', ownerPhone: '555-1234', ownerEmail: 'jane@example.com', registeredAt: '2025-01-01' },
      ];
      const result = lookupMicrochip('CHIP123', db);
      expect(result).not.toBeNull();
      expect(result.petName).toBe('Buddy');
    });

    it('should return null for unknown chip', () => {
      expect(lookupMicrochip('UNKNOWN', [])).toBeNull();
    });
  });

  describe('Flyer Generator', () => {
    it('should generate flyer data from report', () => {
      const report = createReport(baseLostReport);
      const flyer = generateFlyerData(report, '$100');
      expect(flyer.title).toBe('LOST PET');
      expect(flyer.petName).toBe('Buddy');
      expect(flyer.contactPhone).toBe('555-1234');
      expect(flyer.reward).toBe('$100');
    });

    it('should generate found pet flyer', () => {
      const report = createReport({ ...baseLostReport, type: 'found' });
      const flyer = generateFlyerData(report);
      expect(flyer.title).toBe('FOUND PET');
    });

    it('should generate HTML with all fields', () => {
      const report = createReport(baseLostReport);
      const flyer = generateFlyerData(report);
      const html = generateFlyerHtml(flyer);
      expect(html).toContain('LOST PET');
      expect(html).toContain('Buddy');
      expect(html).toContain('golden');
      expect(html).toContain('555-1234');
      expect(html).toContain('<img');
    });

    it('should include reward when provided', () => {
      const report = createReport(baseLostReport);
      const flyer = generateFlyerData(report, '$200');
      const html = generateFlyerHtml(flyer);
      expect(html).toContain('REWARD');
      expect(html).toContain('$200');
    });
  });

  describe('Reunification', () => {
    it('should record reunification', () => {
      const lost = createReport(baseLostReport);
      const found = createReport({ ...baseLostReport, type: 'found' });
      const reunion = recordReunification(lost, found, 'platform-match', 'Great match!');
      expect(reunion.lostReportId).toBe(lost.id);
      expect(reunion.foundReportId).toBe(found.id);
      expect(reunion.method).toBe('platform-match');
      expect(reunion.daysToReunify).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analytics', () => {
    it('should calculate lost/found analytics', () => {
      const reports = [
        createReport(baseLostReport),
        createReport(baseLostReport),
        createReport({ ...baseLostReport, type: 'found' }),
        { ...createReport({ ...baseLostReport, species: 'cat' }), status: 'reunited' },
      ];
      const reunifications = [
        { id: 'r1', lostReportId: 'rpt1', foundReportId: 'rpt2', reunifiedAt: '2026-02-15', method: 'platform-match', notes: '', daysToReunify: 5 },
      ];
      const analytics = calculateLostFoundAnalytics(reports, reunifications);
      expect(analytics.totalLostReports).toBe(3);
      expect(analytics.totalFoundReports).toBe(1);
      expect(analytics.reunifiedCount).toBe(1);
      expect(analytics.averageDaysToReunify).toBe(5);
      expect(analytics.reportsBySpecies['dog']).toBeGreaterThan(0);
    });

    it('should handle empty data', () => {
      const analytics = calculateLostFoundAnalytics([], []);
      expect(analytics.totalLostReports).toBe(0);
      expect(analytics.matchRate).toBe(0);
      expect(analytics.averageDaysToReunify).toBe(0);
    });
  });
});
