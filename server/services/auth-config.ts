const parseIntWithFallback = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
};

export const authConfig = {
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: parseIntWithFallback(process.env.REFRESH_TOKEN_TTL_DAYS, 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'save_a_stray_refresh_token',
  lockoutThreshold: parseIntWithFallback(process.env.AUTH_LOCKOUT_THRESHOLD, 5),
  lockoutDurationMinutes: parseIntWithFallback(process.env.AUTH_LOCKOUT_DURATION_MINUTES, 15),
  passwordResetTtlMinutes: parseIntWithFallback(process.env.PASSWORD_RESET_TTL_MINUTES, 60),
  emailVerificationTtlHours: parseIntWithFallback(process.env.EMAIL_VERIFICATION_TTL_HOURS, 24),
  rateLimitWindowMinutes: parseIntWithFallback(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15),
  rateLimitMaxAttempts: parseIntWithFallback(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS, 20),
  cookieSecureOverride: parseBoolean(process.env.AUTH_COOKIE_SECURE, process.env.NODE_ENV === 'production'),
};

export const getRefreshTokenExpiry = (): Date => {
  const now = Date.now();
  const milliseconds = authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
  return new Date(now + milliseconds);
};

export const getPasswordResetExpiry = (): Date => {
  const now = Date.now();
  return new Date(now + authConfig.passwordResetTtlMinutes * 60 * 1000);
};

export const getEmailVerificationExpiry = (): Date => {
  const now = Date.now();
  return new Date(now + authConfig.emailVerificationTtlHours * 60 * 60 * 1000);
};
