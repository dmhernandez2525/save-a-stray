import crypto from 'crypto';
import { GraphQLContext } from '../graphql/context';
import { UserAuthPayload } from '../../shared/types';
import { UserDocument } from '../models/User';
import { createAccessToken, setRefreshTokenCookie } from './auth-tokens';
import { createSession } from './auth-session';

interface BuildPayloadOptions {
  token: string;
  requiresTwoFactor?: boolean;
  twoFactorSetupPending?: boolean;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const generateRandomPassword = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const buildUserAuthPayload = (
  user: UserDocument,
  options: BuildPayloadOptions
): UserAuthPayload => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    token: options.token,
    loggedIn: options.requiresTwoFactor ? false : true,
    userRole: user.userRole,
    shelterId: user.shelterId?.toString(),
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    requiresTwoFactor: options.requiresTwoFactor,
    twoFactorSetupPending: options.twoFactorSetupPending,
  };
};

export const issueSessionAndAccessToken = async (
  user: UserDocument,
  context?: GraphQLContext
): Promise<UserAuthPayload> => {
  if (!context?.response) {
    const token = createAccessToken({
      id: user._id.toString(),
      userRole: user.userRole,
      shelterId: user.shelterId?.toString(),
      sessionId: 'stateless',
    });

    return buildUserAuthPayload(user, { token });
  }

  const { session, refreshToken } = await createSession({
    userId: user._id.toString(),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  setRefreshTokenCookie(context.response, refreshToken);

  const token = createAccessToken({
    id: user._id.toString(),
    userRole: user.userRole,
    shelterId: user.shelterId?.toString(),
    sessionId: session._id.toString(),
  });

  return buildUserAuthPayload(user, { token });
};
