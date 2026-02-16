import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectDelimiter,
  detectFormat,
  previewImport,
  autoMapFields,
  generateExportFilename,
  formatFileSize,
  convertToFormat,
  getHistory,
  addHistoryEntry,
  clearHistory,
  getHistoryStats,
  ANIMAL_FIELDS,
  EXPORT_ENTITY_TYPES,
} from '../lib/import-export-manager';

describe('Import/Export Manager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('detectDelimiter', () => {
    it('should detect comma delimiter', () => {
      expect(detectDelimiter('name,type,age')).toBe(',');
    });

    it('should detect tab delimiter', () => {
      expect(detectDelimiter('name\ttype\tage')).toBe('\t');
    });

    it('should detect semicolon delimiter', () => {
      expect(detectDelimiter('name;type;age')).toBe(';');
    });

    it('should default to comma', () => {
      expect(detectDelimiter('name')).toBe(',');
    });
  });

  describe('detectFormat', () => {
    it('should detect CSV', () => {
      expect(detectFormat('name,type\nBuddy,Dog')).toBe('csv');
    });

    it('should detect JSON array', () => {
      expect(detectFormat('[{"name": "Buddy"}]')).toBe('json');
    });

    it('should detect JSON object', () => {
      expect(detectFormat('{"data": [{"name": "Buddy"}]}')).toBe('json');
    });
  });

  describe('previewImport', () => {
    it('should preview CSV data', () => {
      const csv = 'name,type,age\nBuddy,Dog,3\nLuna,Cat,2';
      const preview = previewImport(csv);
      expect(preview.headers).toEqual(['name', 'type', 'age']);
      expect(preview.rows).toHaveLength(2);
      expect(preview.totalRows).toBe(2);
      expect(preview.format).toBe('csv');
    });

    it('should limit preview rows', () => {
      const lines = ['name,age'];
      for (let i = 0; i < 10; i++) lines.push(`Animal${i},${i}`);
      const csv = lines.join('\n');
      const preview = previewImport(csv, 3);
      expect(preview.rows).toHaveLength(3);
      expect(preview.totalRows).toBe(10);
    });

    it('should preview JSON data', () => {
      const json = JSON.stringify([{ name: 'Buddy', type: 'Dog' }, { name: 'Luna', type: 'Cat' }]);
      const preview = previewImport(json);
      expect(preview.headers).toEqual(['name', 'type']);
      expect(preview.rows).toHaveLength(2);
      expect(preview.format).toBe('json');
    });

    it('should handle JSON with data wrapper', () => {
      const json = JSON.stringify({ data: [{ name: 'Buddy' }] });
      const preview = previewImport(json);
      expect(preview.headers).toEqual(['name']);
      expect(preview.totalRows).toBe(1);
    });

    it('should handle empty CSV', () => {
      const preview = previewImport('');
      expect(preview.headers).toHaveLength(0);
      expect(preview.totalRows).toBe(0);
    });

    it('should handle invalid JSON', () => {
      const preview = previewImport('{invalid json');
      expect(preview.headers).toHaveLength(0);
      expect(preview.totalRows).toBe(0);
    });
  });

  describe('autoMapFields', () => {
    const targetFields = [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'breed', label: 'Breed' },
      { key: 'age', label: 'Age' },
      { key: 'goodWithKids', label: 'Good With Kids' },
    ];

    it('should map exact matches', () => {
      const mappings = autoMapFields(['name', 'type', 'breed'], targetFields);
      expect(mappings).toHaveLength(3);
      expect(mappings[0]).toEqual({ sourceField: 'name', targetField: 'name' });
    });

    it('should map case-insensitive', () => {
      const mappings = autoMapFields(['Name', 'TYPE', 'Breed'], targetFields);
      expect(mappings).toHaveLength(3);
      expect(mappings[0].targetField).toBe('name');
    });

    it('should map label matches', () => {
      const mappings = autoMapFields(['Good With Kids'], targetFields);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].targetField).toBe('goodWithKids');
    });

    it('should skip unmatchable fields', () => {
      const mappings = autoMapFields(['unknown_field', 'name'], targetFields);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].targetField).toBe('name');
    });
  });

  describe('generateExportFilename', () => {
    it('should generate filename with date', () => {
      const filename = generateExportFilename('Happy Paws', 'animals', 'csv');
      expect(filename).toMatch(/^Happy_Paws_animals_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should sanitize special characters', () => {
      const filename = generateExportFilename("Bob's & Cats!", 'events', 'json');
      expect(filename).toMatch(/^Bob_s___Cats__events_/);
      expect(filename).toContain('.json');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1500000)).toBe('1.4 MB');
    });
  });

  describe('convertToFormat', () => {
    const records = [
      { name: 'Buddy', type: 'Dog', age: 3 },
      { name: 'Luna', type: 'Cat', age: 2 },
    ];
    const fields = ['name', 'type', 'age'];

    it('should convert to CSV', () => {
      const csv = convertToFormat(records, fields, 'csv');
      const lines = csv.split('\n');
      expect(lines[0]).toBe('name,type,age');
      expect(lines[1]).toBe('Buddy,Dog,3');
      expect(lines[2]).toBe('Luna,Cat,2');
    });

    it('should convert to JSON', () => {
      const json = convertToFormat(records, fields, 'json');
      const parsed = JSON.parse(json);
      expect(parsed.data).toHaveLength(2);
      expect(parsed.count).toBe(2);
      expect(parsed.data[0].name).toBe('Buddy');
    });

    it('should handle null values in CSV', () => {
      const csv = convertToFormat([{ name: 'Rex', type: null, age: undefined }], fields, 'csv');
      expect(csv).toContain('Rex,,');
    });

    it('should escape CSV fields with commas', () => {
      const csv = convertToFormat([{ name: 'Rex, Jr.', type: 'Dog', age: 1 }], fields, 'csv');
      expect(csv).toContain('"Rex, Jr."');
    });

    it('should only include specified fields', () => {
      const json = convertToFormat(records, ['name'], 'json');
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed.data[0])).toEqual(['name']);
    });
  });

  describe('History Management', () => {
    it('should start with empty history', () => {
      expect(getHistory()).toHaveLength(0);
    });

    it('should add history entries', () => {
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 10, status: 'success' });
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('import');
      expect(history[0].recordCount).toBe(10);
    });

    it('should add entries in reverse chronological order', () => {
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 5, status: 'success' });
      addHistoryEntry({ type: 'export', entityType: 'animals', format: 'json', recordCount: 20, status: 'success' });
      const history = getHistory();
      expect(history[0].type).toBe('export');
      expect(history[1].type).toBe('import');
    });

    it('should limit history to 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: i, status: 'success' });
      }
      expect(getHistory()).toHaveLength(50);
    });

    it('should clear history', () => {
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 1, status: 'success' });
      clearHistory();
      expect(getHistory()).toHaveLength(0);
    });

    it('should generate unique IDs', () => {
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 1, status: 'success' });
      addHistoryEntry({ type: 'export', entityType: 'animals', format: 'csv', recordCount: 1, status: 'success' });
      const history = getHistory();
      expect(history[0].id).not.toBe(history[1].id);
    });

    it('should include timestamps', () => {
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 1, status: 'success' });
      const history = getHistory();
      expect(new Date(history[0].timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('History Stats', () => {
    it('should return zero stats for empty history', () => {
      const stats = getHistoryStats();
      expect(stats.totalImports).toBe(0);
      expect(stats.totalExports).toBe(0);
      expect(stats.totalRecordsImported).toBe(0);
      expect(stats.totalRecordsExported).toBe(0);
      expect(stats.lastActivity).toBeNull();
    });

    it('should calculate import/export counts', () => {
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 10, status: 'success' });
      addHistoryEntry({ type: 'import', entityType: 'animals', format: 'csv', recordCount: 5, status: 'success' });
      addHistoryEntry({ type: 'export', entityType: 'animals', format: 'json', recordCount: 20, status: 'success' });

      const stats = getHistoryStats();
      expect(stats.totalImports).toBe(2);
      expect(stats.totalExports).toBe(1);
      expect(stats.totalRecordsImported).toBe(15);
      expect(stats.totalRecordsExported).toBe(20);
      expect(stats.lastActivity).not.toBeNull();
    });
  });

  describe('Constants', () => {
    it('should define animal fields with required flags', () => {
      expect(ANIMAL_FIELDS.length).toBeGreaterThan(10);
      const required = ANIMAL_FIELDS.filter(f => f.required);
      expect(required.length).toBeGreaterThan(3);
    });

    it('should define export entity types', () => {
      expect(EXPORT_ENTITY_TYPES).toHaveLength(4);
      const keys = EXPORT_ENTITY_TYPES.map(e => e.key);
      expect(keys).toContain('animals');
      expect(keys).toContain('applications');
    });
  });
});
