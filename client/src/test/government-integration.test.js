import { describe, it, expect } from 'vitest';
import {
  checkComplianceStatus, getDaysUntilExpiry, getUpcomingDeadlines, getExpiredLicenses,
  generateReport, submitReport, formatReportForSubmission, calculateLiveReleaseRate,
  createIncident, assignOfficer, resolveIncident, closeIncident,
  generateCensusData,
  INSPECTION_CHECKLIST, scheduleInspection, completeInspection, getInspectionScore,
  COMPLIANCE_CATEGORIES, searchComplianceDocuments,
  getJurisdictionRequirements, compareJurisdictions,
  createAuditEntry, verifyAuditEntry, queryAuditTrail,
  calculateGovernmentAnalytics,
} from '../lib/government-integration';

describe('Government Integration', () => {

  describe('License Compliance', () => {
    it('should detect compliant license', () => {
      const record = {
        id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'LIC-001',
        issuedAt: '2026-01-01', expiresAt: '2027-01-01', status: 'compliant',
        documents: [], notes: '',
      };
      expect(checkComplianceStatus(record)).toBe('compliant');
    });

    it('should detect warning status within 30 days', () => {
      const soon = new Date(Date.now() + 15 * 86400000).toISOString();
      const record = {
        id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'LIC-001',
        issuedAt: '2025-01-01', expiresAt: soon, status: 'compliant',
        documents: [], notes: '',
      };
      expect(checkComplianceStatus(record)).toBe('warning');
    });

    it('should respect manually set non-compliant status', () => {
      const record = {
        id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'LIC-001',
        issuedAt: '2026-01-01', expiresAt: '2027-01-01', status: 'non-compliant',
        documents: [], notes: '',
      };
      expect(checkComplianceStatus(record)).toBe('non-compliant');
    });

    it('should detect expired license', () => {
      const record = {
        id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'LIC-001',
        issuedAt: '2024-01-01', expiresAt: '2025-01-01', status: 'compliant',
        documents: [], notes: '',
      };
      expect(checkComplianceStatus(record)).toBe('expired');
    });

    it('should calculate days until expiry', () => {
      const future = new Date(Date.now() + 60 * 86400000).toISOString();
      const record = {
        id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'LIC-001',
        issuedAt: '2025-01-01', expiresAt: future, status: 'compliant',
        documents: [], notes: '',
      };
      const days = getDaysUntilExpiry(record);
      expect(days).toBeGreaterThanOrEqual(59);
      expect(days).toBeLessThanOrEqual(61);
    });

    it('should get upcoming deadlines sorted', () => {
      const records = [
        { id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'A', issuedAt: '', expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(), status: 'compliant', documents: [], notes: '' },
        { id: 'l2', requirementId: 'r2', shelterId: 's1', licenseNumber: 'B', issuedAt: '', expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), status: 'compliant', documents: [], notes: '' },
        { id: 'l3', requirementId: 'r3', shelterId: 's1', licenseNumber: 'C', issuedAt: '', expiresAt: new Date(Date.now() + 200 * 86400000).toISOString(), status: 'compliant', documents: [], notes: '' },
      ];
      const upcoming = getUpcomingDeadlines(records, 90);
      expect(upcoming).toHaveLength(2);
      expect(upcoming[0].licenseNumber).toBe('B');
    });

    it('should find expired licenses', () => {
      const records = [
        { id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'A', issuedAt: '', expiresAt: '2025-01-01', status: 'expired', documents: [], notes: '' },
        { id: 'l2', requirementId: 'r2', shelterId: 's1', licenseNumber: 'B', issuedAt: '', expiresAt: '2028-01-01', status: 'compliant', documents: [], notes: '' },
      ];
      expect(getExpiredLicenses(records)).toHaveLength(1);
    });
  });

  describe('Regulatory Reporting', () => {
    const sampleData = {
      totalIntake: 200, totalAdoptions: 150, totalTransfers: 20, totalReturns: 10,
      totalEuthanasia: 5, currentPopulation: 80, intakeBySpecies: { dog: 120, cat: 80 },
      outcomeBySpecies: { dog: 100, cat: 80 }, averageLengthOfStay: 21,
      spayNeuterCount: 180, vaccinationCount: 250,
    };

    it('should generate report in draft status', () => {
      const report = generateReport('OR', 'quarterly', '2026-Q1', sampleData, '2026-04-15');
      expect(report.status).toBe('draft');
      expect(report.jurisdiction).toBe('OR');
    });

    it('should submit report', () => {
      const report = generateReport('OR', 'quarterly', '2026-Q1', sampleData, '2026-04-15');
      const submitted = submitReport(report);
      expect(submitted.status).toBe('submitted');
      expect(submitted.submittedAt).toBeTruthy();
    });

    it('should format as CSV', () => {
      const report = generateReport('OR', 'quarterly', '2026-Q1', sampleData, '2026-04-15', 'csv');
      const csv = formatReportForSubmission(report);
      expect(csv).toContain('Total Intake,200');
      expect(csv).toContain('Total Adoptions,150');
    });

    it('should format as JSON', () => {
      const report = generateReport('OR', 'quarterly', '2026-Q1', sampleData, '2026-04-15', 'json');
      const json = formatReportForSubmission(report);
      const parsed = JSON.parse(json);
      expect(parsed.totalIntake).toBe(200);
    });

    it('should calculate live release rate', () => {
      const rate = calculateLiveReleaseRate(sampleData);
      // (150 + 20 + 10) / (150 + 20 + 10 + 5) = 180/185 = 97%
      expect(rate).toBe(97);
    });

    it('should handle zero outcomes', () => {
      expect(calculateLiveReleaseRate({ ...sampleData, totalAdoptions: 0, totalTransfers: 0, totalReturns: 0, totalEuthanasia: 0 })).toBe(0);
    });
  });

  describe('Animal Control', () => {
    it('should create incident', () => {
      const inc = createIncident('stray', 'citizen1', { address: '123 Main St', lat: 45.5, lng: -122.6 }, 'Stray dog in park');
      expect(inc.status).toBe('reported');
      expect(inc.type).toBe('stray');
    });

    it('should assign officer', () => {
      const inc = createIncident('bite', 'citizen1', { address: 'Park', lat: 45.5, lng: -122.6 }, 'Dog bite');
      const assigned = assignOfficer(inc, 'officer1');
      expect(assigned.status).toBe('assigned');
      expect(assigned.assignedOfficerId).toBe('officer1');
    });

    it('should resolve incident', () => {
      const inc = assignOfficer(
        createIncident('stray', 'citizen1', { address: 'Park', lat: 45.5, lng: -122.6 }, 'Stray'),
        'officer1'
      );
      const resolved = resolveIncident(inc, 'Animal captured and brought to shelter');
      expect(resolved.status).toBe('resolved');
      expect(resolved.resolution).toContain('captured');
    });

    it('should close incident', () => {
      const inc = createIncident('nuisance', 'citizen1', { address: 'Park', lat: 45.5, lng: -122.6 }, 'Noise');
      expect(closeIncident(inc).status).toBe('closed');
    });
  });

  describe('Census Data', () => {
    it('should generate census data', () => {
      const animals = [
        { species: 'dog', status: 'available' },
        { species: 'dog', status: 'adopted' },
        { species: 'cat', status: 'available' },
      ];
      const census = generateCensusData('Multnomah County', '2026-Q1', animals, 50, 40, 21, 85);
      expect(census.totalAnimals).toBe(3);
      expect(census.bySpecies['dog']).toBe(2);
      expect(census.bySpecies['cat']).toBe(1);
      expect(census.intakeRate).toBe(50);
      expect(census.spayNeuterRate).toBe(85);
    });
  });

  describe('Inspection Management', () => {
    it('should have at least 12 checklist items', () => {
      expect(INSPECTION_CHECKLIST.length).toBeGreaterThanOrEqual(12);
    });

    it('should have required and optional items', () => {
      const required = INSPECTION_CHECKLIST.filter(c => c.required);
      const optional = INSPECTION_CHECKLIST.filter(c => !c.required);
      expect(required.length).toBeGreaterThan(0);
      expect(optional.length).toBeGreaterThan(0);
    });

    it('should schedule inspection', () => {
      const insp = scheduleInspection('s1', 'inspector1', '2026-04-01');
      expect(insp.result).toBeNull();
      expect(insp.scheduledDate).toBe('2026-04-01');
    });

    it('should pass inspection when all items pass', () => {
      const insp = scheduleInspection('s1', 'inspector1', '2026-04-01');
      const results = INSPECTION_CHECKLIST.map(c => ({ checklistItemId: c.id, passed: true, notes: '' }));
      const completed = completeInspection(insp, results, 'Excellent');
      expect(completed.result).toBe('pass');
      expect(completed.correctiveActions).toHaveLength(0);
    });

    it('should conditional-pass when optional items fail', () => {
      const insp = scheduleInspection('s1', 'inspector1', '2026-04-01');
      const results = INSPECTION_CHECKLIST.map(c => ({
        checklistItemId: c.id,
        passed: c.required, // required pass, optional fail
        notes: c.required ? '' : 'Needs improvement',
      }));
      const completed = completeInspection(insp, results, 'Minor issues');
      expect(completed.result).toBe('conditional-pass');
      expect(completed.correctiveActions.length).toBeGreaterThan(0);
    });

    it('should fail inspection when required items fail', () => {
      const insp = scheduleInspection('s1', 'inspector1', '2026-04-01');
      const results = INSPECTION_CHECKLIST.map(c => ({ checklistItemId: c.id, passed: false, notes: 'Failed' }));
      const completed = completeInspection(insp, results, 'Major issues');
      expect(completed.result).toBe('fail');
    });

    it('should calculate inspection score', () => {
      const insp = scheduleInspection('s1', 'inspector1', '2026-04-01');
      const results = INSPECTION_CHECKLIST.map((c, i) => ({
        checklistItemId: c.id, passed: i < 6, notes: '',
      }));
      const completed = completeInspection(insp, results, '');
      expect(getInspectionScore(completed)).toBe(50);
    });
  });

  describe('Compliance Documentation', () => {
    it('should define compliance categories', () => {
      expect(COMPLIANCE_CATEGORIES.length).toBeGreaterThanOrEqual(8);
    });

    it('should search documents', () => {
      const docs = [
        { id: 'd1', title: 'Animal Welfare Act Summary', category: 'animal-welfare', jurisdiction: 'federal', content: 'Federal regulations...', version: '1.0', effectiveDate: '2025-01-01', isTemplate: false },
        { id: 'd2', title: 'Oregon Licensing Rules', category: 'licensing', jurisdiction: 'OR', content: 'State requirements...', version: '1.0', effectiveDate: '2025-01-01', isTemplate: true },
      ];
      expect(searchComplianceDocuments(docs, 'welfare')).toHaveLength(1);
      expect(searchComplianceDocuments(docs, '', 'OR')).toHaveLength(2); // OR + federal
      expect(searchComplianceDocuments(docs, '', 'WA')).toHaveLength(1); // federal only
    });
  });

  describe('Multi-Jurisdiction', () => {
    const configs = [
      {
        id: 'OR', name: 'Oregon', state: 'OR',
        requirements: [
          { id: 'r1', jurisdiction: 'OR', name: 'Business License', description: '', renewalPeriodMonths: 12, category: 'licensing', requiredDocuments: [] },
          { id: 'r2', jurisdiction: 'OR', name: 'Animal Facility Permit', description: '', renewalPeriodMonths: 24, category: 'licensing', requiredDocuments: [] },
        ],
        reportingFrequency: 'quarterly', reportFormats: ['csv'], inspectionFrequency: 'annually',
      },
      {
        id: 'WA', name: 'Washington', state: 'WA',
        requirements: [
          { id: 'r3', jurisdiction: 'WA', name: 'Business License', description: '', renewalPeriodMonths: 12, category: 'licensing', requiredDocuments: [] },
          { id: 'r4', jurisdiction: 'WA', name: 'Health Department Approval', description: '', renewalPeriodMonths: 12, category: 'licensing', requiredDocuments: [] },
        ],
        reportingFrequency: 'monthly', reportFormats: ['csv', 'json'], inspectionFrequency: 'semi-annually',
      },
    ];

    it('should get requirements for jurisdiction', () => {
      const reqs = getJurisdictionRequirements(configs, 'OR');
      expect(reqs).toHaveLength(2);
    });

    it('should return empty for unknown jurisdiction', () => {
      expect(getJurisdictionRequirements(configs, 'CA')).toHaveLength(0);
    });

    it('should compare jurisdictions', () => {
      const comparison = compareJurisdictions(configs, 'OR', 'WA');
      expect(comparison.shared).toContain('Business License');
      expect(comparison.onlyFirst).toContain('Animal Facility Permit');
      expect(comparison.onlySecond).toContain('Health Department Approval');
    });
  });

  describe('Audit Trail', () => {
    it('should create audit entry with checksum', () => {
      const entry = createAuditEntry('user1', 'update', 'license', 'l1', { field: 'status' }, '192.168.1.1');
      expect(entry.checksum).toBeTruthy();
      expect(entry.checksum.length).toBe(8);
    });

    it('should reject audit entry without userId', () => {
      expect(() => createAuditEntry('', 'update', 'license', 'l1', {}, '10.0.0.1')).toThrow('userId');
    });

    it('should verify untampered entry', () => {
      const entry = createAuditEntry('user1', 'create', 'report', 'r1', {}, '10.0.0.1');
      expect(verifyAuditEntry(entry)).toBe(true);
    });

    it('should detect tampered entry', () => {
      const entry = createAuditEntry('user1', 'create', 'report', 'r1', {}, '10.0.0.1');
      const tampered = { ...entry, action: 'delete' };
      expect(verifyAuditEntry(tampered)).toBe(false);
    });

    it('should query by user', () => {
      const entries = [
        createAuditEntry('user1', 'create', 'license', 'l1', {}, '10.0.0.1'),
        createAuditEntry('user2', 'update', 'license', 'l2', {}, '10.0.0.2'),
        createAuditEntry('user1', 'delete', 'report', 'r1', {}, '10.0.0.1'),
      ];
      expect(queryAuditTrail(entries, { userId: 'user1' })).toHaveLength(2);
    });

    it('should query by action', () => {
      const entries = [
        createAuditEntry('user1', 'create', 'license', 'l1', {}, '10.0.0.1'),
        createAuditEntry('user1', 'update', 'license', 'l2', {}, '10.0.0.1'),
      ];
      expect(queryAuditTrail(entries, { action: 'create' })).toHaveLength(1);
    });

    it('should query by entity type', () => {
      const entries = [
        createAuditEntry('user1', 'create', 'license', 'l1', {}, '10.0.0.1'),
        createAuditEntry('user1', 'create', 'report', 'r1', {}, '10.0.0.1'),
      ];
      expect(queryAuditTrail(entries, { entityType: 'report' })).toHaveLength(1);
    });
  });

  describe('Government Analytics', () => {
    it('should calculate analytics', () => {
      const reports = [
        { id: 'r1', jurisdiction: 'OR', reportType: 'quarterly', period: '2026-Q1', format: 'csv', status: 'accepted', submittedAt: '2026-04-01', dueDate: '2026-04-15', data: {} },
        { id: 'r2', jurisdiction: 'OR', reportType: 'quarterly', period: '2026-Q2', format: 'csv', status: 'draft', submittedAt: null, dueDate: '2026-07-15', data: {} },
      ];

      const inspections = [
        {
          id: 'i1', shelterId: 's1', inspectorId: 'insp1', scheduledDate: '2026-03-01',
          completedDate: '2026-03-01', result: 'pass',
          checklistResults: [
            { checklistItemId: 'ic1', passed: true, notes: '' },
            { checklistItemId: 'ic2', passed: true, notes: '' },
          ],
          correctiveActions: [], overallNotes: '',
        },
      ];

      const licenses = [
        { id: 'l1', requirementId: 'r1', shelterId: 's1', licenseNumber: 'A', issuedAt: '', expiresAt: '2027-01-01', status: 'compliant', documents: [], notes: '' },
        { id: 'l2', requirementId: 'r2', shelterId: 's1', licenseNumber: 'B', issuedAt: '', expiresAt: '2025-01-01', status: 'expired', documents: [], notes: '' },
      ];

      const correctiveActions = [
        { id: 'ca1', description: 'Fix ventilation', dueDate: '2025-01-01', completedAt: null, status: 'pending' },
      ];

      const analytics = calculateGovernmentAnalytics(reports, inspections, licenses, correctiveActions);
      expect(analytics.totalReportsSubmitted).toBe(1);
      expect(analytics.inspectionPassRate).toBe(100);
      expect(analytics.averageInspectionScore).toBe(100);
      expect(analytics.overdueActions).toBe(1);
      expect(analytics.licenseStatus.compliant).toBe(1);
      expect(analytics.licenseStatus.expired).toBe(1);
    });

    it('should handle empty data', () => {
      const analytics = calculateGovernmentAnalytics([], [], [], []);
      expect(analytics.totalReportsSubmitted).toBe(0);
      expect(analytics.complianceRate).toBe(0);
      expect(analytics.inspectionPassRate).toBe(0);
    });
  });
});
