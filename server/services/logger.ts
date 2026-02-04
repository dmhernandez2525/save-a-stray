type LogLevel = 'info' | 'warn' | 'error';
type LogData = Record<string, string | number | boolean | null | undefined>;

const writeLog = (level: LogLevel, message: string, data?: LogData): void => {
  const timestamp = new Date().toISOString();
  const payload = data ? { timestamp, level, message, ...data } : { timestamp, level, message };
  const line = `${JSON.stringify(payload)}\n`;
  if (level === 'error') {
    process.stderr.write(line);
    return;
  }
  process.stdout.write(line);
};

export const logger = {
  info: (message: string, data?: LogData): void => writeLog('info', message, data),
  warn: (message: string, data?: LogData): void => writeLog('warn', message, data),
  error: (message: string, data?: LogData): void => writeLog('error', message, data),
};
