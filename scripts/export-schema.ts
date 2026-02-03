import fs from 'fs';
import path from 'path';
import { printSchema } from 'graphql';
import schema from '../server/schema/schema';
import { logger } from '../server/services/logger';

const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'docs', 'schema');

const ensureOutputDir = (outputDir: string): void => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

export const exportSchema = (outputDir: string = DEFAULT_OUTPUT_DIR): string => {
  ensureOutputDir(outputDir);
  const outputFile = path.join(outputDir, 'schema.graphql');
  const schemaSDL = printSchema(schema);
  fs.writeFileSync(outputFile, schemaSDL, 'utf8');
  logger.info('schema_exported', { file: outputFile });
  return outputFile;
};

if (process.env.NODE_ENV !== 'test') {
  exportSchema();
}
