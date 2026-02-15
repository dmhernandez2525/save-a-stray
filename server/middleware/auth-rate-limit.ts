import { NextFunction, Request, Response } from 'express';
import { authConfig } from '../services/auth-config';
import { logger } from '../services/logger';

interface RateEntry {
  count: number;
  resetAt: number;
}

const targetOperations = [
  'register',
  'login',
  'requestPasswordReset',
  'resetPassword',
  'refreshToken',
  'completeGoogleOAuth',
  'completeFacebookOAuth',
] as const;

const operationMatchers = targetOperations.map((operation) => ({
  operation,
  pattern: new RegExp(`\\b${operation}\\b`, 'i'),
}));

const attempts = new Map<string, RateEntry>();

const resolveIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
};

const extractQueryString = (req: Request): string => {
  if (typeof req.body?.query === 'string') {
    return req.body.query;
  }
  return '';
};

const getTargetOperation = (query: string): string | null => {
  if (!query) return null;

  for (const matcher of operationMatchers) {
    if (matcher.pattern.test(query)) {
      return matcher.operation;
    }
  }

  return null;
};

const isBlocked = (entry: RateEntry, now: number): boolean => {
  return entry.count >= authConfig.rateLimitMaxAttempts && entry.resetAt > now;
};

const respondRateLimited = (res: Response): void => {
  res.status(429).json({
    errors: [
      {
        message: 'Too many authentication attempts. Please try again later.',
        extensions: {
          code: 'TOO_MANY_REQUESTS',
        },
      },
    ],
  });
};

export const authRateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const query = extractQueryString(req);
  const targetOperation = getTargetOperation(query);

  if (!targetOperation) {
    next();
    return;
  }

  const now = Date.now();
  const key = `${resolveIp(req)}:${targetOperation}`;
  const windowMs = authConfig.rateLimitWindowMinutes * 60 * 1000;
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    next();
    return;
  }

  if (isBlocked(existing, now)) {
    logger.warn('auth_rate_limit_blocked', {
      key,
      operation: targetOperation,
    });
    respondRateLimited(res);
    return;
  }

  existing.count += 1;
  attempts.set(key, existing);
  next();
};
