import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Import Job Model ──────────────────────────────────────────

export interface ImportJobDocument extends Document {
  shelterId: string;
  userId: string;
  filename: string;
  format: 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  successCount: number;
  errorCount: number;
  importErrors: string[];
  createdAt: Date;
  completedAt?: Date;
}

const ImportJobSchema = new Schema<ImportJobDocument>({
  shelterId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  format: { type: String, enum: ['csv', 'json'], default: 'csv' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  totalRows: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  importErrors: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const ImportJobModel: Model<ImportJobDocument> =
  mongoose.models.importJob || mongoose.model<ImportJobDocument>('importJob', ImportJobSchema);

// ── Export Job Model ──────────────────────────────────────────

export interface ExportJobDocument extends Document {
  shelterId: string;
  userId: string;
  format: 'csv' | 'json';
  entityType: 'animals' | 'applications' | 'events' | 'donations';
  filters: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordCount: number;
  fileUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

const ExportJobSchema = new Schema<ExportJobDocument>({
  shelterId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  format: { type: String, enum: ['csv', 'json'], default: 'csv' },
  entityType: { type: String, enum: ['animals', 'applications', 'events', 'donations'], required: true },
  filters: { type: String, default: '{}' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  recordCount: { type: Number, default: 0 },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const ExportJobModel: Model<ExportJobDocument> =
  mongoose.models.exportJob || mongoose.model<ExportJobDocument>('exportJob', ExportJobSchema);

// ── Field Mapping Config ──────────────────────────────────────

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'lowercase' | 'uppercase' | 'trim' | 'number' | 'date';
}

export const ANIMAL_EXPORT_FIELDS = [
  'name', 'type', 'breed', 'age', 'sex', 'color', 'status',
  'description', 'size', 'temperament', 'energyLevel',
  'houseTrained', 'goodWithKids', 'goodWithDogs', 'goodWithCats',
  'specialNeeds', 'microchipId', 'adoptionFee',
] as const;

export const ANIMAL_REQUIRED_IMPORT_FIELDS = [
  'name', 'type', 'age', 'sex', 'color', 'description',
] as const;

export const EXPORT_FORMATS = {
  csv: { name: 'CSV', extension: '.csv', mimeType: 'text/csv' },
  json: { name: 'JSON', extension: '.json', mimeType: 'application/json' },
} as const;

// ── CSV Generation ────────────────────────────────────────────

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsvFromRecords(
  records: Record<string, unknown>[],
  fields: readonly string[]
): string {
  const header = fields.map(f => escapeCsvField(f)).join(',');
  const rows = records.map(record =>
    fields.map(f => {
      const val = record[f];
      if (val === null || val === undefined) return '';
      return escapeCsvField(String(val));
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

// ── JSON Generation ───────────────────────────────────────────

export function generateJsonFromRecords(
  records: Record<string, unknown>[],
  fields: readonly string[]
): string {
  const filtered = records.map(record => {
    const obj: Record<string, unknown> = {};
    for (const field of fields) {
      obj[field] = record[field] ?? null;
    }
    return obj;
  });
  return JSON.stringify({ data: filtered, exportedAt: new Date().toISOString(), count: filtered.length }, null, 2);
}

// ── CSV Parsing (server-side) ─────────────────────────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

export interface ImportValidationResult {
  valid: boolean;
  records: Record<string, string>[];
  errors: string[];
  warnings: string[];
}

export function validateCsvImport(content: string): ImportValidationResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const result: ImportValidationResult = { valid: false, records: [], errors: [], warnings: [] };

  if (lines.length < 2) {
    result.errors.push('CSV must have a header row and at least one data row.');
    return result;
  }

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const missing = ANIMAL_REQUIRED_IMPORT_FIELDS.filter(f => !headers.includes(f));
  if (missing.length > 0) {
    result.errors.push(`Missing required columns: ${missing.join(', ')}`);
    return result;
  }

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });

    const rowErrors: string[] = [];
    if (!row.name) rowErrors.push('name is required');
    if (!row.type) rowErrors.push('type is required');
    if (!row.age || isNaN(Number(row.age))) rowErrors.push('age must be a number');
    if (!row.sex) rowErrors.push('sex is required');
    if (!row.color) rowErrors.push('color is required');
    if (!row.description) rowErrors.push('description is required');

    if (rowErrors.length > 0) {
      result.errors.push(`Row ${i + 1}: ${rowErrors.join('; ')}`);
    } else {
      result.records.push(row);
    }
  }

  if (result.records.length > 50) {
    result.warnings.push(`Import limited to 50 records. ${result.records.length - 50} records will be skipped.`);
    result.records = result.records.slice(0, 50);
  }

  result.valid = result.errors.length === 0 && result.records.length > 0;
  return result;
}

// ── JSON Import Parsing ───────────────────────────────────────

export function validateJsonImport(content: string): ImportValidationResult {
  const result: ImportValidationResult = { valid: false, records: [], errors: [], warnings: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    result.errors.push('Invalid JSON format.');
    return result;
  }

  const items = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>).data;
  if (!Array.isArray(items) || items.length === 0) {
    result.errors.push('JSON must contain an array of animal records.');
    return result;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    const row: Record<string, string> = {};
    for (const key of Object.keys(item)) {
      row[key.toLowerCase()] = String(item[key] ?? '');
    }

    const rowErrors: string[] = [];
    if (!row.name) rowErrors.push('name is required');
    if (!row.type) rowErrors.push('type is required');
    if (!row.age || isNaN(Number(row.age))) rowErrors.push('age must be a number');
    if (!row.sex) rowErrors.push('sex is required');
    if (!row.color) rowErrors.push('color is required');
    if (!row.description) rowErrors.push('description is required');

    if (rowErrors.length > 0) {
      result.errors.push(`Record ${i + 1}: ${rowErrors.join('; ')}`);
    } else {
      result.records.push(row);
    }
  }

  if (result.records.length > 50) {
    result.warnings.push(`Import limited to 50 records. ${result.records.length - 50} records will be skipped.`);
    result.records = result.records.slice(0, 50);
  }

  result.valid = result.errors.length === 0 && result.records.length > 0;
  return result;
}

// ── Field Transform ───────────────────────────────────────────

export function applyFieldMapping(
  record: Record<string, string>,
  mappings: FieldMapping[]
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...record };

  for (const mapping of mappings) {
    const value = record[mapping.sourceField];
    if (value === undefined) continue;

    let transformed: unknown = value;
    if (mapping.transform === 'lowercase') transformed = value.toLowerCase();
    else if (mapping.transform === 'uppercase') transformed = value.toUpperCase();
    else if (mapping.transform === 'trim') transformed = value.trim();
    else if (mapping.transform === 'number') transformed = Number(value) || 0;
    else if (mapping.transform === 'date') transformed = new Date(value).toISOString();

    if (mapping.sourceField !== mapping.targetField) {
      delete result[mapping.sourceField];
    }
    result[mapping.targetField] = transformed;
  }

  return result;
}
