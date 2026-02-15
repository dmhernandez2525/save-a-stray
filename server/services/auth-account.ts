import bcrypt from 'bcryptjs';
import User, { UserDocument } from '../models/User';
import { UserAuthPayload } from '../../shared/types';
import { GraphQLContext } from '../graphql/context';
import {
  buildUserAuthPayload,
  issueSessionAndAccessToken,
  normalizeEmail,
  generateRandomPassword,
} from './auth-helpers';
import {
  createOneTimeToken,
  hashAuthToken,
} from './auth-tokens';
import { getEmailVerificationExpiry, getPasswordResetExpiry } from './auth-config';
import { revokeAllSessionsForUser, getActiveSessionsForUser, revokeSessionById } from './auth-session';
import { AuthSessionDocument } from '../models/AuthSession';
import { sendEmailVerificationEmail, sendPasswordResetEmail } from './email';
import {
  generateTotpSecret,
  createTotpUri,
  encryptSecret,
  decryptSecret,
  verifyTotpCode,
  generateBackupCodes,
  hashBackupCode,
} from './totp';
import { exchangeGoogleCode, exchangeFacebookCode, OAuthProfile } from './oauth';

export const verifyEmail = async (token: string): Promise<boolean> => {
  const tokenHash = hashAuthToken(token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();

  return true;
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  const normalized = normalizeEmail(email);
  const user = await User.findOne({ email: normalized });

  // Always return true to prevent email enumeration
  if (!user) {
    return true;
  }

  const token = createOneTimeToken();
  user.passwordResetTokenHash = hashAuthToken(token);
  user.passwordResetExpiresAt = getPasswordResetExpiry();
  await user.save();

  await sendPasswordResetEmail(user.email, token);
  return true;
};

export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const tokenHash = hashAuthToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  user.failedLoginAttempts = 0;
  user.lockoutUntil = undefined;
  await user.save();

  await revokeAllSessionsForUser(user._id.toString(), 'password_reset');

  return true;
};

interface TwoFactorSetupResult {
  secret: string;
  uri: string;
  backupCodes: string[];
}

export const setupTwoFactor = async (userId: string): Promise<TwoFactorSetupResult> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.twoFactorEnabled) {
    throw new Error('Two-factor authentication is already enabled');
  }

  const secret = generateTotpSecret();
  const uri = createTotpUri(secret, user.email);
  const backupCodes = generateBackupCodes();
  const backupHashes = backupCodes.map(hashBackupCode);

  user.twoFactorTempSecret = encryptSecret(secret);
  user.twoFactorBackupCodes = backupHashes;
  await user.save();

  return { secret, uri, backupCodes };
};

export const confirmTwoFactor = async (
  userId: string,
  totpCode: string
): Promise<UserAuthPayload> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.twoFactorEnabled) {
    throw new Error('Two-factor authentication is already enabled');
  }

  if (!user.twoFactorTempSecret) {
    throw new Error('Two-factor setup has not been initiated');
  }

  const secret = decryptSecret(user.twoFactorTempSecret);
  if (!verifyTotpCode(secret, totpCode)) {
    throw new Error('Invalid verification code');
  }

  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = undefined;
  user.twoFactorEnabled = true;
  await user.save();

  return buildUserAuthPayload(user, { token: '', twoFactorSetupPending: false });
};

export const disableTwoFactor = async (
  userId: string,
  password: string
): Promise<UserAuthPayload> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.twoFactorEnabled) {
    throw new Error('Two-factor authentication is not enabled');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error('Invalid password');
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorTempSecret = undefined;
  user.twoFactorBackupCodes = undefined;
  await user.save();

  return buildUserAuthPayload(user, { token: '' });
};

export { getActiveSessionsForUser, revokeSessionById };

const findOrCreateOAuthUser = async (
  profile: OAuthProfile,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  const providerIdField = profile.provider === 'google' ? 'googleId' : 'fbookId';
  const email = normalizeEmail(profile.email);

  let user = await User.findOne({
    $or: [{ [providerIdField]: profile.providerId }, { email }],
  });

  if (!user) {
    const password = await bcrypt.hash(generateRandomPassword(), 12);
    user = new User({
      name: profile.name,
      email,
      password,
      userRole: 'endUser',
      [providerIdField]: profile.providerId,
      emailVerified: true,
    });
    await user.save();
  } else {
    user[providerIdField as keyof UserDocument] = profile.providerId as never;
    if (!user.emailVerified) {
      user.emailVerified = true;
    }
    await user.save();
  }

  return issueSessionAndAccessToken(user, context);
};

export const completeGoogleOAuth = async (
  code: string,
  redirectUri: string,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  const profile = await exchangeGoogleCode(code, redirectUri);
  return findOrCreateOAuthUser(profile, context);
};

export const completeFacebookOAuth = async (
  code: string,
  redirectUri: string,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  const profile = await exchangeFacebookCode(code, redirectUri);
  return findOrCreateOAuthUser(profile, context);
};

export const resendEmailVerification = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.emailVerified) {
    throw new Error('Email is already verified');
  }

  const token = createOneTimeToken();
  user.emailVerificationTokenHash = hashAuthToken(token);
  user.emailVerificationExpiresAt = getEmailVerificationExpiry();
  await user.save();

  await sendEmailVerificationEmail(user.email, token);
  return true;
};
