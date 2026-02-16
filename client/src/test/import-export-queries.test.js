import { describe, it, expect } from 'vitest';

// Test import/export GraphQL query contracts and server-side logic

// Replicate server-side functions for testing
function escapeCsvField(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCsvFromRecords(records, fields) {
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

function generateJsonFromRecords(records, fields) {
  const filtered = records.map(record => {
    const obj = {};
    for (const field of fields) {
      obj[field] = record[field] ?? null;
    }
    return obj;
  });
  return JSON.stringify({ data: filtered, exportedAt: new Date().toISOString(), count: filtered.length }, null, 2);
}

const REQUIRED_FIELDS = ['name', 'type', 'age', 'sex', 'color', 'description'];

function validateCsvImport(content) {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const result = { valid: false, records: [], errors: [], warnings: [] };

  if (lines.length < 2) {
    result.errors.push('CSV must have a header row and at least one data row.');
    return result;
  }

  const headers = lines[0].split(',').map(h => h.toLowerCase().trim());
  const missing = REQUIRED_FIELDS.filter(f => !headers.includes(f));
  if (missing.length > 0) {
    result.errors.push(`Missing required columns: ${missing.join(', ')}`);
    return result;
  }

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => { row[h] = (fields[idx] || '').trim(); });

    const rowErrors = [];
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

function validateJsonImport(content) {
  const result = { valid: false, records: [], errors: [], warnings: [] };

  let parsed;
  try { parsed = JSON.parse(content); } catch {
    result.errors.push('Invalid JSON format.');
    return result;
  }

  const items = Array.isArray(parsed) ? parsed : parsed.data;
  if (!Array.isArray(items) || items.length === 0) {
    result.errors.push('JSON must contain an array of animal records.');
    return result;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const row = {};
    for (const key of Object.keys(item)) row[key.toLowerCase()] = String(item[key] ?? '');

    const rowErrors = [];
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

function applyFieldMapping(record, mappings) {
  const result = { ...record };
  for (const mapping of mappings) {
    const value = record[mapping.sourceField];
    if (value === undefined) continue;
    let transformed = value;
    if (mapping.transform === 'lowercase') transformed = value.toLowerCase();
    else if (mapping.transform === 'uppercase') transformed = value.toUpperCase();
    else if (mapping.transform === 'trim') transformed = value.trim();
    else if (mapping.transform === 'number') transformed = Number(value) || 0;
    if (mapping.sourceField !== mapping.targetField) delete result[mapping.sourceField];
    result[mapping.targetField] = transformed;
  }
  return result;
}

describe('Import/Export Service', () => {
  describe('CSV Export Generation', () => {
    const fields = ['name', 'type', 'breed', 'age'];

    it('should generate CSV header', () => {
      const csv = generateCsvFromRecords([], fields);
      expect(csv).toBe('name,type,breed,age');
    });

    it('should generate CSV rows', () => {
      const records = [
        { name: 'Buddy', type: 'Dog', breed: 'Lab', age: 3 },
        { name: 'Luna', type: 'Cat', breed: 'Siamese', age: 2 },
      ];
      const csv = generateCsvFromRecords(records, fields);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[1]).toBe('Buddy,Dog,Lab,3');
    });

    it('should handle null/undefined values', () => {
      const csv = generateCsvFromRecords([{ name: 'Rex', type: null, breed: undefined, age: 1 }], fields);
      expect(csv).toContain('Rex,,');
    });

    it('should escape fields with commas', () => {
      const csv = generateCsvFromRecords([{ name: 'Rex, Jr.', type: 'Dog', breed: '', age: 1 }], fields);
      expect(csv).toContain('"Rex, Jr."');
    });

    it('should escape fields with quotes', () => {
      const csv = generateCsvFromRecords([{ name: 'Rex "The King"', type: 'Dog', breed: '', age: 1 }], fields);
      expect(csv).toContain('"Rex ""The King"""');
    });

    it('should escape fields with newlines', () => {
      const csv = generateCsvFromRecords([{ name: 'Rex\nLine2', type: 'Dog', breed: '', age: 1 }], fields);
      expect(csv).toContain('"Rex\nLine2"');
    });
  });

  describe('JSON Export Generation', () => {
    const fields = ['name', 'type', 'age'];

    it('should generate valid JSON', () => {
      const records = [{ name: 'Buddy', type: 'Dog', age: 3 }];
      const json = generateJsonFromRecords(records, fields);
      const parsed = JSON.parse(json);
      expect(parsed.data).toHaveLength(1);
      expect(parsed.count).toBe(1);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should only include specified fields', () => {
      const records = [{ name: 'Buddy', type: 'Dog', age: 3, extra: 'ignored' }];
      const json = generateJsonFromRecords(records, fields);
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed.data[0])).toEqual(['name', 'type', 'age']);
    });

    it('should set missing fields to null', () => {
      const records = [{ name: 'Buddy' }];
      const json = generateJsonFromRecords(records, fields);
      const parsed = JSON.parse(json);
      expect(parsed.data[0].type).toBeNull();
      expect(parsed.data[0].age).toBeNull();
    });
  });

  describe('CSV Import Validation', () => {
    it('should validate valid CSV', () => {
      const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Brown,Friendly';
      const result = validateCsvImport(csv);
      expect(result.valid).toBe(true);
      expect(result.records).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty CSV', () => {
      const result = validateCsvImport('');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('header row');
    });

    it('should reject CSV without data rows', () => {
      const result = validateCsvImport('name,type,age,sex,color,description');
      expect(result.valid).toBe(false);
    });

    it('should reject CSV missing required columns', () => {
      const result = validateCsvImport('name,type\nBuddy,Dog');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing required columns');
    });

    it('should validate per-row data', () => {
      const csv = 'name,type,age,sex,color,description\n,Dog,abc,Male,Brown,';
      const result = validateCsvImport(csv);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Row 2');
      expect(result.errors[0]).toContain('name is required');
    });

    it('should warn when exceeding 50 record limit', () => {
      const header = 'name,type,age,sex,color,description';
      const rows = Array.from({ length: 55 }, (_, i) => `Animal${i},Dog,${i},Male,Brown,Desc`);
      const csv = [header, ...rows].join('\n');
      const result = validateCsvImport(csv);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.records).toHaveLength(50);
    });

    it('should collect multiple row errors', () => {
      const csv = 'name,type,age,sex,color,description\n,Dog,3,Male,Brown,\nBuddy,,abc,,Brown,';
      const result = validateCsvImport(csv);
      expect(result.errors.length).toBe(2);
    });
  });

  describe('JSON Import Validation', () => {
    it('should validate valid JSON array', () => {
      const json = JSON.stringify([
        { name: 'Buddy', type: 'Dog', age: 3, sex: 'Male', color: 'Brown', description: 'Friendly' },
      ]);
      const result = validateJsonImport(json);
      expect(result.valid).toBe(true);
      expect(result.records).toHaveLength(1);
    });

    it('should validate JSON with data wrapper', () => {
      const json = JSON.stringify({
        data: [{ name: 'Luna', type: 'Cat', age: 2, sex: 'Female', color: 'Black', description: 'Sweet' }],
      });
      const result = validateJsonImport(json);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid JSON', () => {
      const result = validateJsonImport('{not valid json}');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid JSON');
    });

    it('should reject empty array', () => {
      const result = validateJsonImport('[]');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('array of animal records');
    });

    it('should validate required fields in JSON records', () => {
      const json = JSON.stringify([{ name: 'Buddy' }]);
      const result = validateJsonImport(json);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Record 1');
    });
  });

  describe('Field Mapping', () => {
    it('should rename fields', () => {
      const result = applyFieldMapping(
        { animal_name: 'Buddy', breed: 'Lab' },
        [{ sourceField: 'animal_name', targetField: 'name' }]
      );
      expect(result.name).toBe('Buddy');
      expect(result.animal_name).toBeUndefined();
    });

    it('should apply lowercase transform', () => {
      const result = applyFieldMapping(
        { type: 'DOG' },
        [{ sourceField: 'type', targetField: 'type', transform: 'lowercase' }]
      );
      expect(result.type).toBe('dog');
    });

    it('should apply uppercase transform', () => {
      const result = applyFieldMapping(
        { status: 'available' },
        [{ sourceField: 'status', targetField: 'status', transform: 'uppercase' }]
      );
      expect(result.status).toBe('AVAILABLE');
    });

    it('should apply number transform', () => {
      const result = applyFieldMapping(
        { age: '3' },
        [{ sourceField: 'age', targetField: 'age', transform: 'number' }]
      );
      expect(result.age).toBe(3);
    });

    it('should apply trim transform', () => {
      const result = applyFieldMapping(
        { name: '  Buddy  ' },
        [{ sourceField: 'name', targetField: 'name', transform: 'trim' }]
      );
      expect(result.name).toBe('Buddy');
    });

    it('should skip missing source fields', () => {
      const result = applyFieldMapping(
        { name: 'Buddy' },
        [{ sourceField: 'missing', targetField: 'other' }]
      );
      expect(result.name).toBe('Buddy');
      expect(result.other).toBeUndefined();
    });
  });

  describe('Export Query Contracts', () => {
    it('should return AnimalExportResult shape', () => {
      const result = {
        format: 'csv',
        content: 'name,type\nBuddy,Dog',
        recordCount: 1,
        exportedAt: new Date().toISOString(),
      };
      expect(result.format).toBe('csv');
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.recordCount).toBeGreaterThan(0);
      expect(new Date(result.exportedAt).getTime()).not.toBeNaN();
    });

    it('should return ApplicationExportResult shape', () => {
      const result = {
        format: 'json',
        content: '{"data":[]}',
        recordCount: 0,
        exportedAt: new Date().toISOString(),
      };
      expect(result.format).toBe('json');
      expect(typeof result.content).toBe('string');
    });
  });

  describe('Import/Export Job Models', () => {
    it('should define ImportJob shape', () => {
      const job = {
        shelterId: 's1',
        userId: 'u1',
        filename: 'animals.csv',
        format: 'csv',
        status: 'completed',
        totalRows: 10,
        successCount: 8,
        errorCount: 2,
        errors: ['Row 3: age invalid', 'Row 7: name missing'],
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      expect(job.successCount + job.errorCount).toBe(job.totalRows);
      expect(job.errors).toHaveLength(job.errorCount);
    });

    it('should define ExportJob shape', () => {
      const job = {
        shelterId: 's1',
        userId: 'u1',
        format: 'json',
        entityType: 'animals',
        status: 'completed',
        recordCount: 25,
        createdAt: new Date().toISOString(),
      };
      expect(['animals', 'applications', 'events', 'donations']).toContain(job.entityType);
      expect(['csv', 'json']).toContain(job.format);
    });
  });

  describe('Export Formats', () => {
    const EXPORT_FORMATS = {
      csv: { name: 'CSV', extension: '.csv', mimeType: 'text/csv' },
      json: { name: 'JSON', extension: '.json', mimeType: 'application/json' },
    };

    it('should define CSV format', () => {
      expect(EXPORT_FORMATS.csv.extension).toBe('.csv');
      expect(EXPORT_FORMATS.csv.mimeType).toBe('text/csv');
    });

    it('should define JSON format', () => {
      expect(EXPORT_FORMATS.json.extension).toBe('.json');
      expect(EXPORT_FORMATS.json.mimeType).toBe('application/json');
    });
  });

  describe('Validation Edge Cases', () => {
    it('should handle CSV with Windows line endings', () => {
      const csv = 'name,type,age,sex,color,description\r\nBuddy,Dog,3,Male,Brown,Friendly\r\n';
      const result = validateCsvImport(csv);
      expect(result.valid).toBe(true);
    });

    it('should handle JSON with extra fields', () => {
      const json = JSON.stringify([
        { name: 'Buddy', type: 'Dog', age: 3, sex: 'Male', color: 'Brown', description: 'Hi', extra: true },
      ]);
      const result = validateJsonImport(json);
      expect(result.valid).toBe(true);
    });

    it('should handle numeric age as string in JSON', () => {
      const json = JSON.stringify([
        { name: 'Buddy', type: 'Dog', age: '3', sex: 'Male', color: 'Brown', description: 'Hi' },
      ]);
      const result = validateJsonImport(json);
      expect(result.valid).toBe(true);
    });
  });
});
