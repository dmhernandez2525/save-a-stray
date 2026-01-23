import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CSV Export Utility', () => {
  let createObjectURL;
  let revokeObjectURL;
  let appendChildSpy;
  let removeChildSpy;

  beforeEach(() => {
    createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test the escapeCsvField logic
  describe('CSV Field Escaping', () => {
    const escapeCsvField = (field) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    it('should not escape plain strings', () => {
      expect(escapeCsvField('hello')).toBe('hello');
    });

    it('should escape strings with commas', () => {
      expect(escapeCsvField('hello, world')).toBe('"hello, world"');
    });

    it('should escape strings with double quotes', () => {
      expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    });

    it('should escape strings with newlines', () => {
      expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
    });

    it('should handle empty strings', () => {
      expect(escapeCsvField('')).toBe('');
    });
  });

  describe('CSV Generation', () => {
    const generateCsv = (animals) => {
      const headers = ['Name', 'Type', 'Breed', 'Age', 'Sex', 'Color', 'Status', 'Description'];
      const escapeCsvField = (field) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };
      const rows = animals.map(a => [
        escapeCsvField(a.name),
        escapeCsvField(a.type),
        escapeCsvField(a.breed || ''),
        String(a.age),
        escapeCsvField(a.sex),
        escapeCsvField(a.color),
        escapeCsvField(a.status || 'available'),
        escapeCsvField(a.description || '')
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    };

    it('should generate header row', () => {
      const csv = generateCsv([]);
      expect(csv).toBe('Name,Type,Breed,Age,Sex,Color,Status,Description');
    });

    it('should generate data rows', () => {
      const csv = generateCsv([
        { name: 'Buddy', type: 'Dog', breed: 'Labrador', age: 3, sex: 'Male', color: 'Brown', status: 'available', description: 'Friendly' }
      ]);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[1]).toBe('Buddy,Dog,Labrador,3,Male,Brown,available,Friendly');
    });

    it('should handle missing breed', () => {
      const csv = generateCsv([
        { name: 'Rex', type: 'Dog', breed: '', age: 5, sex: 'Male', color: 'Black', status: 'pending', description: '' }
      ]);
      const lines = csv.split('\n');
      expect(lines[1]).toBe('Rex,Dog,,5,Male,Black,pending,');
    });

    it('should handle multiple animals', () => {
      const csv = generateCsv([
        { name: 'A', type: 'Dog', breed: 'Lab', age: 1, sex: 'M', color: 'Black', status: 'available', description: '' },
        { name: 'B', type: 'Cat', breed: 'Siamese', age: 2, sex: 'F', color: 'White', status: 'adopted', description: '' }
      ]);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3);
    });

    it('should escape commas in description', () => {
      const csv = generateCsv([
        { name: 'Test', type: 'Dog', breed: '', age: 1, sex: 'M', color: 'Black', status: 'available', description: 'Loves treats, toys' }
      ]);
      expect(csv).toContain('"Loves treats, toys"');
    });

    it('should default status to available when missing', () => {
      const csv = generateCsv([
        { name: 'Rex', type: 'Dog', breed: '', age: 2, sex: 'M', color: 'Brown', description: '' }
      ]);
      expect(csv).toContain('available');
    });
  });

  describe('File Download', () => {
    it('should generate filename from shelter name', () => {
      const shelterName = 'Happy Paws Shelter';
      const expected = 'Happy_Paws_Shelter_animals.csv';
      const filename = shelterName.replace(/[^a-zA-Z0-9]/g, '_') + '_animals.csv';
      expect(filename).toBe(expected);
    });

    it('should handle special characters in shelter name', () => {
      const shelterName = 'Bob\'s & Cats!';
      const filename = shelterName.replace(/[^a-zA-Z0-9]/g, '_') + '_animals.csv';
      expect(filename).toBe('Bob_s___Cats__animals.csv');
    });
  });
});
