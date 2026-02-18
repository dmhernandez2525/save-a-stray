// ── Import/Export Manager ────────────────────────────────────
// Client-side utilities for managing data import/export operations

export interface ImportConfig {
  format: 'csv' | 'json';
  shelterId: string;
  filename: string;
  mappings?: FieldMapping[];
  maxRecords?: number;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'lowercase' | 'uppercase' | 'trim' | 'number' | 'date';
}

export interface ExportConfig {
  format: 'csv' | 'json';
  entityType: 'animals' | 'applications' | 'events' | 'donations';
  shelterId: string;
  filters?: Record<string, string>;
  fields?: string[];
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedCount: number;
  errorCount: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface ExportResult {
  success: boolean;
  format: string;
  recordCount: number;
  content: string;
  filename: string;
  duration: number;
}

// ── Field Definitions ─────────────────────────────────────────

export const ANIMAL_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'breed', label: 'Breed', required: false },
  { key: 'age', label: 'Age', required: true },
  { key: 'sex', label: 'Sex', required: true },
  { key: 'color', label: 'Color', required: true },
  { key: 'status', label: 'Status', required: false },
  { key: 'description', label: 'Description', required: true },
  { key: 'size', label: 'Size', required: false },
  { key: 'temperament', label: 'Temperament', required: false },
  { key: 'energyLevel', label: 'Energy Level', required: false },
  { key: 'houseTrained', label: 'House Trained', required: false },
  { key: 'goodWithKids', label: 'Good With Kids', required: false },
  { key: 'goodWithDogs', label: 'Good With Dogs', required: false },
  { key: 'goodWithCats', label: 'Good With Cats', required: false },
  { key: 'specialNeeds', label: 'Special Needs', required: false },
  { key: 'microchipId', label: 'Microchip ID', required: false },
  { key: 'adoptionFee', label: 'Adoption Fee', required: false },
] as const;

export const EXPORT_ENTITY_TYPES = [
  { key: 'animals', label: 'Animals', description: 'All animal listings' },
  { key: 'applications', label: 'Applications', description: 'Adoption applications' },
  { key: 'events', label: 'Events', description: 'Shelter events' },
  { key: 'donations', label: 'Donations', description: 'Donation records' },
] as const;

// ── CSV Parsing ───────────────────────────────────────────────

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

export function detectDelimiter(content: string): string {
  const firstLine = content.split(/\r?\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

export function detectFormat(content: string): 'csv' | 'json' {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  return 'csv';
}

export function previewImport(content: string, maxRows: number = 5): {
  headers: string[];
  rows: string[][];
  totalRows: number;
  format: 'csv' | 'json';
} {
  const format = detectFormat(content);

  if (format === 'json') {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { headers: [], rows: [], totalRows: 0, format };
    }

    const items = Array.isArray(parsed) ? parsed : ((parsed as Record<string, unknown>).data as unknown[]) || [];
    if (items.length === 0) return { headers: [], rows: [], totalRows: 0, format };

    const headers = Object.keys(items[0] as Record<string, unknown>);
    const rows = items.slice(0, maxRows).map(item =>
      headers.map(h => String((item as Record<string, unknown>)[h] ?? ''))
    );

    return { headers, rows, totalRows: items.length, format };
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [], totalRows: 0, format };

  // Return headers even for header-only CSVs (no data rows)
  if (lines.length === 1) {
    return { headers: parseCsvLine(lines[0]), rows: [], totalRows: 0, format };
  }

  const headers = parseCsvLine(lines[0]);
  const dataLines = lines.slice(1);
  const rows = dataLines.slice(0, maxRows).map(line => parseCsvLine(line));

  return { headers, rows, totalRows: dataLines.length, format };
}

// ── Field Mapping ─────────────────────────────────────────────

export function autoMapFields(
  sourceHeaders: string[],
  targetFields: { key: string; label: string }[]
): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  for (const header of sourceHeaders) {
    const normalized = header.toLowerCase().trim().replace(/[\s_-]+/g, '');

    const exactMatch = targetFields.find(f => f.key.toLowerCase() === normalized);
    if (exactMatch) {
      mappings.push({ sourceField: header, targetField: exactMatch.key });
      continue;
    }

    const labelMatch = targetFields.find(f =>
      f.label.toLowerCase().replace(/[\s_-]+/g, '') === normalized
    );
    if (labelMatch) {
      mappings.push({ sourceField: header, targetField: labelMatch.key });
      continue;
    }

    const partialMatch = targetFields.find(f =>
      normalized.includes(f.key.toLowerCase()) || f.key.toLowerCase().includes(normalized)
    );
    if (partialMatch) {
      mappings.push({ sourceField: header, targetField: partialMatch.key });
    }
  }

  return mappings;
}

// ── Export Utilities ──────────────────────────────────────────

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateExportFilename(
  shelterName: string,
  entityType: string,
  format: string
): string {
  const sanitized = shelterName.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `${sanitized}_${entityType}_${date}.${format}`;
}

export function downloadContent(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Delay revocation so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function convertToFormat(
  records: Record<string, unknown>[],
  fields: string[],
  format: 'csv' | 'json'
): string {
  if (format === 'json') {
    const filtered = records.map(r => {
      const obj: Record<string, unknown> = {};
      for (const f of fields) obj[f] = r[f] ?? null;
      return obj;
    });
    return JSON.stringify({ data: filtered, count: filtered.length }, null, 2);
  }

  const header = fields.map(f => escapeCsvField(f)).join(',');
  const rows = records.map(r =>
    fields.map(f => {
      const val = r[f];
      if (val === null || val === undefined) return '';
      return escapeCsvField(String(val));
    }).join(',')
  );
  // UTF-8 BOM for Excel compatibility
  return '\uFEFF' + [header, ...rows].join('\n');
}

// ── Import/Export History ─────────────────────────────────────

const HISTORY_KEY = 'import_export_history';
const MAX_HISTORY = 50;

interface HistoryEntry {
  id: string;
  type: 'import' | 'export';
  entityType: string;
  format: string;
  recordCount: number;
  status: 'success' | 'failed';
  timestamp: string;
  filename?: string;
  errors?: string[];
}

export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const history = getHistory();
  history.unshift({
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getHistoryStats(): {
  totalImports: number;
  totalExports: number;
  totalRecordsImported: number;
  totalRecordsExported: number;
  lastActivity: string | null;
} {
  const history = getHistory();
  const imports = history.filter(h => h.type === 'import');
  const exports = history.filter(h => h.type === 'export');

  return {
    totalImports: imports.length,
    totalExports: exports.length,
    totalRecordsImported: imports.reduce((sum, h) => sum + h.recordCount, 0),
    totalRecordsExported: exports.reduce((sum, h) => sum + h.recordCount, 0),
    lastActivity: history.length > 0 ? history[0].timestamp : null,
  };
}
