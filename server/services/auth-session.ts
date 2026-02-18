import mongoose from 'mongoose';
import AuthSession, { AuthSessionDocument } from '../models/AuthSession';
import { createDeviceFingerprint, createRefreshToken, hashAuthToken } from './auth-tokens';
import { getRefreshTokenExpiry } from './auth-config';

export interface SessionContextInput {
  ipAddress?: string;
  userAgent?: string;
}

interface CreateSessionInput extends SessionContextInput {
  userId: string;
}

interface RotateSessionInput extends SessionContextInput {
  sessionId: string;
}

export const createSession = async (
  input: CreateSessionInput
): Promise<{ session: AuthSessionDocument; refreshToken: string }> => {
  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashAuthToken(refreshToken);
  const ipAddress = input.ipAddress || 'unknown';
  const deviceFingerprint = createDeviceFingerprint(input.userAgent, ipAddress);

  const session = new AuthSession({
    userId: new mongoose.Types.ObjectId(input.userId),
    refreshTokenHash,
    deviceFingerprint,
    userAgent: input.userAgent,
    ipAddress,
    expiresAt: getRefreshTokenExpiry(),
    createdAt: new Date(),
    lastUsedAt: new Date(),
  });

  await session.save();
  return { session, refreshToken };
};

export const rotateSessionRefreshToken = async (
  input: RotateSessionInput
): Promise<{ session: AuthSessionDocument; refreshToken: string } | null> => {
  const session = await AuthSession.findById(input.sessionId);
  if (!session) {
    return null;
  }

  if (session.revokedAt) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  const refreshToken = createRefreshToken();
  session.refreshTokenHash = hashAuthToken(refreshToken);
  session.lastUsedAt = new Date();
  session.expiresAt = getRefreshTokenExpiry();
  session.ipAddress = input.ipAddress || session.ipAddress;
  session.userAgent = input.userAgent || session.userAgent;
  await session.save();

  return { session, refreshToken };
};

export const findSessionByRefreshToken = async (
  refreshToken: string
): Promise<AuthSessionDocument | null> => {
  const refreshTokenHash = hashAuthToken(refreshToken);
  return AuthSession.findOne({ refreshTokenHash });
};

export const revokeSessionById = async (
  sessionId: string,
  reason = 'manual_revocation'
): Promise<boolean> => {
  const session = await AuthSession.findById(sessionId);
  if (!session) {
    return false;
  }

  if (!session.revokedAt) {
    session.revokedAt = new Date();
    session.revokedReason = reason;
    await session.save();
  }

  return true;
};

export const revokeAllSessionsForUser = async (userId: string, reason = 'global_logout'): Promise<void> => {
  await AuthSession.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      revokedAt: { $exists: false },
    },
    {
      $set: {
        revokedAt: new Date(),
        revokedReason: reason,
      },
    }
  );
};

export const getActiveSessionsForUser = async (userId: string): Promise<AuthSessionDocument[]> => {
  return AuthSession.find({
    userId: new mongoose.Types.ObjectId(userId),
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};
