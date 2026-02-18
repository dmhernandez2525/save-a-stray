import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import keys from '../../config/keys';
import { authConfig, getRefreshTokenExpiry } from './auth-config';

export interface AccessTokenPayload {
  id: string;
  userRole: string;
  shelterId?: string;
  sessionId: string;
}

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  expires: Date;
}

const serializeCookie = (name: string, value: string, options: CookieOptions): string => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Expires=${options.expires.toUTCString()}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
};

export const createAccessToken = (payload: AccessTokenPayload): string => {
  const secret: Secret = keys.secretOrKey;
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: authConfig.accessTokenTtl as unknown as number,
  };
  return jwt.sign(payload as object, secret, options);
};

export const createRefreshToken = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

export const createOneTimeToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashAuthToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const createDeviceFingerprint = (userAgent: string | undefined, ipAddress: string): string => {
  const source = `${userAgent || 'unknown'}:${ipAddress}`;
  return crypto.createHash('sha256').update(source).digest('hex');
};

export const setRefreshTokenCookie = (response: Response, refreshToken: string): void => {
  const cookie = serializeCookie(authConfig.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: authConfig.cookieSecureOverride,
    sameSite: 'lax',
    path: '/',
    expires: getRefreshTokenExpiry(),
  });

  response.setHeader('Set-Cookie', cookie);
};

export const clearRefreshTokenCookie = (response: Response): void => {
  const cookie = serializeCookie(authConfig.refreshCookieName, '', {
    httpOnly: true,
    secure: authConfig.cookieSecureOverride,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  response.setHeader('Set-Cookie', cookie);
};
