// ── Government Integration System ───────────────────────────
// License compliance, regulatory reporting, inspections, audit trail, multi-jurisdiction

// ── License Compliance ──────────────────────────────────────

export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant' | 'expired';

export interface LicenseRequirement {
  id: string;
  jurisdiction: string;
  name: string;
  description: string;
  renewalPeriodMonths: number;
  category: string;
  requiredDocuments: string[];
}

export interface LicenseRecord {
  id: string;
  requirementId: string;
  shelterId: string;
  licenseNumber: string;
  issuedAt: string;
  expiresAt: string;
  status: ComplianceStatus;
  documents: { name: string; uploadedAt: string; url: string }[];
  notes: string;
}

export function checkComplianceStatus(record: LicenseRecord): ComplianceStatus {
  // Respect manually set non-compliant status
  if (record.status === 'non-compliant') return 'non-compliant';

  const now = new Date();
  const expires = new Date(record.expiresAt);
  const daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / 86400000);

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry < 30) return 'warning';
  return 'compliant';
}

export function getDaysUntilExpiry(record: LicenseRecord): number {
  const now = new Date();
  const expires = new Date(record.expiresAt);
  return Math.floor((expires.getTime() - now.getTime()) / 86400000);
}

export function getUpcomingDeadlines(
  records: LicenseRecord[],
  withinDays: number = 90
): LicenseRecord[] {
  return records
    .filter(r => {
      const days = getDaysUntilExpiry(r);
      return days >= 0 && days <= withinDays;
    })
    .sort((a, b) => getDaysUntilExpiry(a) - getDaysUntilExpiry(b));
}

export function getExpiredLicenses(records: LicenseRecord[]): LicenseRecord[] {
  return records.filter(r => getDaysUntilExpiry(r) < 0);
}

// ── Regulatory Reporting ────────────────────────────────────

export type ReportFormat = 'pdf' | 'csv' | 'json' | 'xml';
export type ReportFrequency = 'monthly' | 'quarterly' | 'annually';

export interface RegulatoryReport {
  id: string;
  jurisdiction: string;
  reportType: string;
  period: string;           // e.g. "2026-Q1"
  format: ReportFormat;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  submittedAt: string | null;
  dueDate: string;
  data: ReportData;
}

export interface ReportData {
  totalIntake: number;
  totalAdoptions: number;
  totalTransfers: number;
  totalReturns: number;
  totalEuthanasia: number;
  currentPopulation: number;
  intakeBySpecies: Record<string, number>;
  outcomeBySpecies: Record<string, number>;
  averageLengthOfStay: number;
  spayNeuterCount: number;
  vaccinationCount: number;
}

export function generateReport(
  jurisdiction: string,
  reportType: string,
  period: string,
  data: ReportData,
  dueDate: string,
  format: ReportFormat = 'csv'
): RegulatoryReport {
  return {
    id: `rpt_${Date.now()}`,
    jurisdiction,
    reportType,
    period,
    format,
    status: 'draft',
    submittedAt: null,
    dueDate,
    data,
  };
}

export function submitReport(report: RegulatoryReport): RegulatoryReport {
  return { ...report, status: 'submitted', submittedAt: new Date().toISOString() };
}

export function formatReportForSubmission(report: RegulatoryReport): string {
  const d = report.data;
  if (report.format === 'csv') {
    const lines = [
      'Metric,Value',
      `Total Intake,${d.totalIntake}`,
      `Total Adoptions,${d.totalAdoptions}`,
      `Total Transfers,${d.totalTransfers}`,
      `Total Returns,${d.totalReturns}`,
      `Total Euthanasia,${d.totalEuthanasia}`,
      `Current Population,${d.currentPopulation}`,
      `Average Length of Stay,${d.averageLengthOfStay}`,
      `Spay/Neuter Count,${d.spayNeuterCount}`,
      `Vaccination Count,${d.vaccinationCount}`,
      ...Object.entries(d.intakeBySpecies).map(([species, count]) => `Intake - ${species},${count}`),
      ...Object.entries(d.outcomeBySpecies).map(([species, count]) => `Outcome - ${species},${count}`),
    ];
    return lines.join('\n');
  }
  if (report.format === 'json') {
    return JSON.stringify(report.data, null, 2);
  }
  return `Report: ${report.reportType} - ${report.period}`;
}

export function calculateLiveReleaseRate(data: ReportData): number {
  const totalOutcome = data.totalAdoptions + data.totalTransfers + data.totalReturns + data.totalEuthanasia;
  if (totalOutcome === 0) return 0;
  const liveOutcomes = data.totalAdoptions + data.totalTransfers + data.totalReturns;
  return Math.round((liveOutcomes / totalOutcome) * 100);
}

// ── Animal Control Integration ──────────────────────────────

export type IncidentType = 'stray' | 'bite' | 'cruelty' | 'nuisance' | 'abandonment' | 'hoarding';
export type IncidentStatus = 'reported' | 'assigned' | 'investigating' | 'resolved' | 'closed';

export interface IncidentReport {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  reportedAt: string;
  reportedBy: string;
  location: { address: string; lat: number; lng: number };
  description: string;
  assignedOfficerId: string | null;
  animalIds: string[];
  resolution: string | null;
  resolvedAt: string | null;
}

export function createIncident(
  type: IncidentType,
  reportedBy: string,
  location: IncidentReport['location'],
  description: string
): IncidentReport {
  return {
    id: `inc_${Date.now()}`,
    type,
    status: 'reported',
    reportedAt: new Date().toISOString(),
    reportedBy,
    location,
    description,
    assignedOfficerId: null,
    animalIds: [],
    resolution: null,
    resolvedAt: null,
  };
}

export function assignOfficer(incident: IncidentReport, officerId: string): IncidentReport {
  return { ...incident, assignedOfficerId: officerId, status: 'assigned' };
}

export function resolveIncident(incident: IncidentReport, resolution: string): IncidentReport {
  return {
    ...incident,
    status: 'resolved',
    resolution,
    resolvedAt: new Date().toISOString(),
  };
}

export function closeIncident(incident: IncidentReport): IncidentReport {
  if (incident.status !== 'resolved') throw new Error('Can only close resolved incidents');
  return { ...incident, status: 'closed' };
}

// ── Census Data ─────────────────────────────────────────────

export interface CensusData {
  jurisdiction: string;
  period: string;
  totalAnimals: number;
  bySpecies: Record<string, number>;
  byStatus: Record<string, number>;
  intakeRate: number;       // per month
  adoptionRate: number;     // per month
  avgLengthOfStay: number;  // days
  spayNeuterRate: number;   // percentage
}

export function generateCensusData(
  jurisdiction: string,
  period: string,
  animals: { species: string; status: string }[],
  intakePerMonth: number,
  adoptionsPerMonth: number,
  avgLos: number,
  spayNeuterRate: number
): CensusData {
  const bySpecies: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const a of animals) {
    bySpecies[a.species] = (bySpecies[a.species] || 0) + 1;
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
  }

  return {
    jurisdiction,
    period,
    totalAnimals: animals.length,
    bySpecies,
    byStatus,
    intakeRate: intakePerMonth,
    adoptionRate: adoptionsPerMonth,
    avgLengthOfStay: avgLos,
    spayNeuterRate,
  };
}

// ── Inspection Management ───────────────────────────────────

export type InspectionResult = 'pass' | 'conditional-pass' | 'fail';

export interface InspectionChecklist {
  id: string;
  category: string;
  item: string;
  required: boolean;
}

export interface Inspection {
  id: string;
  shelterId: string;
  inspectorId: string;
  scheduledDate: string;
  completedDate: string | null;
  result: InspectionResult | null;
  checklistResults: { checklistItemId: string; passed: boolean; notes: string }[];
  correctiveActions: CorrectiveAction[];
  overallNotes: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  dueDate: string;
  completedAt: string | null;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

export const INSPECTION_CHECKLIST: InspectionChecklist[] = [
  { id: 'ic1', category: 'Facility', item: 'Adequate ventilation and temperature control', required: true },
  { id: 'ic2', category: 'Facility', item: 'Clean and sanitary conditions', required: true },
  { id: 'ic3', category: 'Facility', item: 'Proper waste disposal procedures', required: true },
  { id: 'ic4', category: 'Animal Care', item: 'Fresh water available at all times', required: true },
  { id: 'ic5', category: 'Animal Care', item: 'Appropriate nutrition and feeding schedule', required: true },
  { id: 'ic6', category: 'Animal Care', item: 'Veterinary care protocols in place', required: true },
  { id: 'ic7', category: 'Records', item: 'Intake records maintained for all animals', required: true },
  { id: 'ic8', category: 'Records', item: 'Medical records up to date', required: true },
  { id: 'ic9', category: 'Safety', item: 'Fire safety equipment present and inspected', required: true },
  { id: 'ic10', category: 'Safety', item: 'Emergency evacuation plan posted', required: false },
  { id: 'ic11', category: 'Staff', item: 'Staff trained in animal handling', required: true },
  { id: 'ic12', category: 'Staff', item: 'Background checks completed for all staff', required: false },
];

export function scheduleInspection(
  shelterId: string,
  inspectorId: string,
  date: string
): Inspection {
  return {
    id: `insp_${Date.now()}`,
    shelterId,
    inspectorId,
    scheduledDate: date,
    completedDate: null,
    result: null,
    checklistResults: [],
    correctiveActions: [],
    overallNotes: '',
  };
}

export function completeInspection(
  inspection: Inspection,
  checklistResults: Inspection['checklistResults'],
  notes: string
): Inspection {
  const requiredItems = INSPECTION_CHECKLIST.filter(c => c.required);
  const requiredResults = checklistResults.filter(r =>
    requiredItems.some(c => c.id === r.checklistItemId)
  );
  // Ensure all required items have results; missing items count as failed
  const allRequiredCovered = requiredItems.every(c =>
    checklistResults.some(r => r.checklistItemId === c.id)
  );
  const allRequiredPassed = allRequiredCovered && requiredResults.every(r => r.passed);
  const allPassed = checklistResults.length > 0 && checklistResults.every(r => r.passed);

  let result: InspectionResult;
  if (allPassed) result = 'pass';
  else if (allRequiredPassed) result = 'conditional-pass';
  else result = 'fail';

  const correctiveActions: CorrectiveAction[] = checklistResults
    .filter(r => !r.passed)
    .map((r, i) => ({
      id: `ca_${Date.now()}_${i}`,
      description: `Address: ${r.notes || 'Failed inspection item'}`,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      completedAt: null,
      status: 'pending' as const,
    }));

  return {
    ...inspection,
    completedDate: new Date().toISOString(),
    result,
    checklistResults,
    correctiveActions,
    overallNotes: notes,
  };
}

export function getInspectionScore(inspection: Inspection): number {
  if (inspection.checklistResults.length === 0) return 0;
  const passed = inspection.checklistResults.filter(r => r.passed).length;
  return Math.round((passed / inspection.checklistResults.length) * 100);
}

// ── Compliance Documentation ────────────────────────────────

export interface ComplianceDocument {
  id: string;
  title: string;
  category: string;
  jurisdiction: string;
  content: string;
  version: string;
  effectiveDate: string;
  isTemplate: boolean;
}

export const COMPLIANCE_CATEGORIES = [
  'licensing', 'animal-welfare', 'facility-standards', 'record-keeping',
  'veterinary-care', 'euthanasia-protocols', 'staff-requirements', 'reporting',
];

export function searchComplianceDocuments(
  documents: ComplianceDocument[],
  query: string,
  jurisdiction?: string
): ComplianceDocument[] {
  const q = query.toLowerCase();
  return documents.filter(d => {
    if (jurisdiction && d.jurisdiction !== jurisdiction && d.jurisdiction !== 'federal') return false;
    return d.title.toLowerCase().includes(q) ||
           d.category.toLowerCase().includes(q) ||
           d.content.toLowerCase().includes(q);
  });
}

// ── Multi-Jurisdiction Support ──────────────────────────────

export interface JurisdictionConfig {
  id: string;
  name: string;
  state: string;
  requirements: LicenseRequirement[];
  reportingFrequency: ReportFrequency;
  reportFormats: ReportFormat[];
  inspectionFrequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
}

export function getJurisdictionRequirements(
  configs: JurisdictionConfig[],
  jurisdictionId: string
): LicenseRequirement[] {
  const config = configs.find(c => c.id === jurisdictionId);
  return config ? config.requirements : [];
}

export function compareJurisdictions(
  configs: JurisdictionConfig[],
  id1: string,
  id2: string
): { shared: string[]; onlyFirst: string[]; onlySecond: string[] } {
  const j1 = configs.find(c => c.id === id1);
  const j2 = configs.find(c => c.id === id2);
  if (!j1 || !j2) return { shared: [], onlyFirst: [], onlySecond: [] };

  const reqs1 = new Set(j1.requirements.map(r => r.name));
  const reqs2 = new Set(j2.requirements.map(r => r.name));

  return {
    shared: [...reqs1].filter(r => reqs2.has(r)),
    onlyFirst: [...reqs1].filter(r => !reqs2.has(r)),
    onlySecond: [...reqs2].filter(r => !reqs1.has(r)),
  };
}

// ── Audit Trail ─────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  checksum: string;
}

export function createAuditEntry(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>,
  ipAddress: string
): AuditEntry {
  if (!userId) throw new Error('userId (performedBy) is required for audit entries');
  if (!action) throw new Error('action is required for audit entries');
  if (!entityType) throw new Error('entityType is required for audit entries');
  const timestamp = new Date().toISOString();
  const entry: Omit<AuditEntry, 'checksum'> = {
    id: `audit_${Date.now()}`,
    timestamp,
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
  };

  // Tamper-evident checksum
  const checksum = generateChecksum(JSON.stringify(entry));

  return { ...entry, checksum };
}

function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function verifyAuditEntry(entry: AuditEntry): boolean {
  const { checksum, ...rest } = entry;
  const computed = generateChecksum(JSON.stringify(rest));
  return computed === checksum;
}

export function queryAuditTrail(
  entries: AuditEntry[],
  filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }
): AuditEntry[] {
  return entries.filter(e => {
    if (filters.userId && e.userId !== filters.userId) return false;
    if (filters.action && e.action !== filters.action) return false;
    if (filters.entityType && e.entityType !== filters.entityType) return false;
    if (filters.startDate && e.timestamp < filters.startDate) return false;
    if (filters.endDate && e.timestamp > filters.endDate) return false;
    return true;
  });
}

// ── Government Reporting Analytics ──────────────────────────

export interface GovernmentAnalytics {
  totalReportsSubmitted: number;
  complianceRate: number;
  inspectionPassRate: number;
  averageInspectionScore: number;
  overdueActions: number;
  licenseStatus: Record<ComplianceStatus, number>;
}

export function calculateGovernmentAnalytics(
  reports: RegulatoryReport[],
  inspections: Inspection[],
  licenses: LicenseRecord[],
  correctiveActions: CorrectiveAction[]
): GovernmentAnalytics {
  const submitted = reports.filter(r => r.status === 'submitted' || r.status === 'accepted');
  const completedInspections = inspections.filter(i => i.result !== null);
  const passedInspections = completedInspections.filter(i => i.result === 'pass' || i.result === 'conditional-pass');

  const avgScore = completedInspections.length > 0
    ? Math.round(completedInspections.reduce((s, i) => s + getInspectionScore(i), 0) / completedInspections.length)
    : 0;

  const overdue = correctiveActions.filter(a => a.status === 'pending' && new Date(a.dueDate) < new Date());

  const licenseStatus: Record<ComplianceStatus, number> = {
    compliant: 0, warning: 0, 'non-compliant': 0, expired: 0,
  };
  for (const l of licenses) {
    const status = checkComplianceStatus(l);
    licenseStatus[status]++;
  }

  const complianceRate = licenses.length > 0
    ? Math.round((licenseStatus.compliant / licenses.length) * 100)
    : 0;

  return {
    totalReportsSubmitted: submitted.length,
    complianceRate,
    inspectionPassRate: completedInspections.length > 0
      ? Math.round((passedInspections.length / completedInspections.length) * 100) : 0,
    averageInspectionScore: avgScore,
    overdueActions: overdue.length,
    licenseStatus,
  };
}
