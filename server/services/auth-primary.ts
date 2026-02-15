import bcrypt from 'bcryptjs';
import User, { UserDocument } from '../models/User';
import Shelter from '../models/Shelter';
import validateRegisterInput from '../validation/register';
import validateLoginInput from '../validation/login';
import { LoginInput, RegisterInput, UserAuthPayload } from '../../shared/types';
import { GraphQLContext } from '../graphql/context';
import {
  buildUserAuthPayload,
  issueSessionAndAccessToken,
  normalizeEmail,
} from './auth-helpers';
import {
  clearRefreshTokenCookie,
  createOneTimeToken,
  createAccessToken,
  hashAuthToken,
  setRefreshTokenCookie
} from './auth-tokens';
import { authConfig, getEmailVerificationExpiry } from './auth-config';
import {
  findSessionByRefreshToken,
  revokeSessionById,
  rotateSessionRefreshToken,
} from './auth-session';
import { sendEmailVerificationEmail } from './email';
import { decryptSecret, verifyBackupCode, verifyTotpCode } from './totp';

interface TokenData {
  token: string;
}

interface IdTokenData {
  _id: string;
}

const registerFailedLoginAttempt = async (user: UserDocument): Promise<void> => {
  const attempts = (user.failedLoginAttempts || 0) + 1;
  user.failedLoginAttempts = attempts;

  if (attempts >= authConfig.lockoutThreshold) {
    user.lockoutUntil = new Date(Date.now() + authConfig.lockoutDurationMinutes * 60 * 1000);
    user.failedLoginAttempts = 0;
  }

  await user.save();
};

const assertAccountUnlocked = (user: UserDocument): void => {
  if (!user.lockoutUntil) {
    return;
  }

  if (user.lockoutUntil.getTime() <= Date.now()) {
    return;
  }

  throw new Error('Account temporarily locked due to repeated failed login attempts');
};

const createEmailVerificationToken = async (user: UserDocument): Promise<void> => {
  const token = createOneTimeToken();
  user.emailVerificationTokenHash = hashAuthToken(token);
  user.emailVerificationExpiresAt = getEmailVerificationExpiry();
  await sendEmailVerificationEmail(user.email, token);
};

const verifySecondFactorIfRequired = async (
  user: UserDocument,
  input: LoginInput
): Promise<UserAuthPayload | null> => {
  if (!user.twoFactorEnabled) {
    return null;
  }

  const totpCode = input.totpCode?.trim();
  const backupCode = input.backupCode?.trim();
  if (!totpCode && !backupCode) {
    return buildUserAuthPayload(user, {
      token: '',
      requiresTwoFactor: true,
    });
  }

  const encryptedSecret = user.twoFactorSecret;
  if (!encryptedSecret) {
    throw new Error('Two-factor authentication is enabled but not configured');
  }

  const secret = decryptSecret(encryptedSecret);
  if (totpCode) {
    if (!verifyTotpCode(secret, totpCode)) {
      await registerFailedLoginAttempt(user);
      throw new Error('Invalid two-factor authentication code');
    }

    return null;
  }

  const backupCodes = user.twoFactorBackupCodes || [];
  const backupValidation = verifyBackupCode(backupCode || '', backupCodes);
  if (!backupValidation.isValid) {
    await registerFailedLoginAttempt(user);
    throw new Error('Invalid backup code');
  }

  user.twoFactorBackupCodes = backupValidation.remainingHashes;
  await user.save();
  return null;
};

export const register = async (
  data: RegisterInput,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  const { message, isValid } = validateRegisterInput(data);
  if (!isValid) {
    throw new Error(message);
  }

  const email = normalizeEmail(data.email);
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error('This email is already used');
  }

  const existingName = await User.findOne({ name: data.name });
  if (existingName) {
    throw new Error('This name is taken');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  let resolvedShelterId = data.shelterId;

  if (data.userRole === 'shelter') {
    if (!data.shelterName || !data.shelterLocation || !data.shelterPaymentEmail) {
      throw new Error('Shelter registration requires name, location, and payment email');
    }

    const existingShelter = await Shelter.findOne({ name: data.shelterName });
    if (existingShelter) {
      throw new Error('A shelter with this name already exists');
    }

    const createdShelter = new Shelter({
      name: data.shelterName,
      location: data.shelterLocation,
      paymentEmail: data.shelterPaymentEmail,
    });
    await createdShelter.save();
    resolvedShelterId = createdShelter._id.toString();
  }

  const user = new User({
    name: data.name,
    email,
    password: hashedPassword,
    userRole: data.userRole,
    shelterId: resolvedShelterId,
    emailVerified: false,
  });

  await createEmailVerificationToken(user);
  await user.save();

  if (resolvedShelterId) {
    const shelter = await Shelter.findById(resolvedShelterId);
    if (shelter) {
      shelter.users.push(user._id as unknown as typeof shelter.users[0]);
      await shelter.save();
    }
  }

  return issueSessionAndAccessToken(user, context);
};

export const login = async (
  data: LoginInput,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  const { message, isValid } = validateLoginInput(data);
  if (!isValid) {
    throw new Error(message);
  }

  const email = normalizeEmail(data.email);
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  assertAccountUnlocked(user);

  const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
  if (!isPasswordCorrect) {
    await registerFailedLoginAttempt(user);
    throw new Error('Invalid credentials');
  }

  const twoFactorPayload = await verifySecondFactorIfRequired(user, data);
  if (twoFactorPayload) {
    return twoFactorPayload;
  }

  user.failedLoginAttempts = 0;
  user.lockoutUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  return issueSessionAndAccessToken(user, context);
};

export const refreshToken = async (context: GraphQLContext): Promise<UserAuthPayload> => {
  if (!context.refreshToken || !context.response) {
    throw new Error('Refresh token not found');
  }

  const session = await findSessionByRefreshToken(context.refreshToken);
  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    throw new Error('Refresh token is invalid or expired');
  }

  const user = await User.findById(session.userId);
  if (!user) {
    throw new Error('User not found for refresh token');
  }

  const rotatedSession = await rotateSessionRefreshToken({
    sessionId: session._id.toString(),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  if (!rotatedSession) {
    throw new Error('Unable to rotate refresh token');
  }

  setRefreshTokenCookie(context.response, rotatedSession.refreshToken);

  const token = createAccessToken({
    id: user._id.toString(),
    userRole: user.userRole,
    shelterId: user.shelterId?.toString(),
    sessionId: rotatedSession.session._id.toString(),
  });

  return buildUserAuthPayload(user, { token });
};

export const logout = async (
  data: IdTokenData,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  const user = await User.findById(context?.userId || data._id);
  if (!user) {
    throw new Error('This user does not exist');
  }

  if (context?.sessionId && context.sessionId !== 'stateless') {
    await revokeSessionById(context.sessionId, 'logout');
  } else if (context?.refreshToken) {
    const session = await findSessionByRefreshToken(context.refreshToken);
    if (session) {
      await revokeSessionById(session._id.toString(), 'logout');
    }
  }

  if (context?.response) {
    clearRefreshTokenCookie(context.response);
  }

  return buildUserAuthPayload(user, {
    token: '',
  });
};
