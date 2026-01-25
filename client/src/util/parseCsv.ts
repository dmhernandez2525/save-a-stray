export interface ParsedAnimal {
  name: string;
  type: string;
  breed: string;
  age: number;
  sex: string;
  color: string;
  description: string;
  image: string;
  video: string;
}

export interface ParseResult {
  animals: ParsedAnimal[];
  errors: string[];
}

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

const REQUIRED_HEADERS = ['name', 'type', 'age', 'sex', 'color', 'description'];

export function parseCsv(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    return { animals: [], errors: ['CSV must have a header row and at least one data row.'] };
  }

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return { animals: [], errors: [`Missing required columns: ${missingHeaders.join(', ')}`] };
  }

  const animals: ParsedAnimal[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = fields[idx] || '';
    });

    const rowErrors: string[] = [];
    if (!row.name) rowErrors.push('name is required');
    if (!row.type) rowErrors.push('type is required');
    if (!row.age || isNaN(Number(row.age))) rowErrors.push('age must be a number');
    if (!row.sex) rowErrors.push('sex is required');
    if (!row.color) rowErrors.push('color is required');
    if (!row.description) rowErrors.push('description is required');

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join('; ')}`);
    } else {
      animals.push({
        name: row.name,
        type: row.type,
        breed: row.breed || '',
        age: parseInt(row.age, 10),
        sex: row.sex,
        color: row.color,
        description: row.description,
        image: row.image || '',
        video: row.video || ''
      });
    }
  }

  return { animals, errors };
}
