import fs from 'fs';
import os from 'os';
import path from 'path';
import { exportSchema } from '../scripts/export-schema';

describe('schema export script', () => {
  it('writes schema.graphql to the output directory', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'save-a-stray-schema-'));
    const outputFile = exportSchema(tempDir);
    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, 'utf8');
    expect(contents).toContain('schema');
  });
});
