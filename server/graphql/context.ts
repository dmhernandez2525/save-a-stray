import jwt from 'jsonwebtoken';
import { Request } from 'express';
import keys from '../../config/keys';
import { createLoaders, Loaders } from './loaders';

// Validate JWT secret at startup to prevent silent auth failures
if (!keys.secretOrKey || keys.secretOrKey.length < 32) {
  throw new Error(
    'SECRET_OR_KEY must be configured with at least 32 characters. ' +
    'Set the JWT_SECRET or SECRET_OR_KEY environment variable.'
  );
}

export interface GraphQLContext {
  loaders: Loaders;
  userId?: string;
  userRole?: string;
  shelterId?: string;
}

interface TokenPayload extends jwt.JwtPayload {
  id?: string | number;
  userRole?: string;
  shelterId?: string;
}

const getTokenFromHeader = (header?: string): string | null => {
  if (!header) return null;
  if (header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim() || null;
  }
  return header.trim() || null;
};

const isJwtPayload = (value: string | jwt.JwtPayload): value is jwt.JwtPayload =>
  typeof value === 'object' && value !== null;

const isTokenPayload = (value: jwt.JwtPayload): value is TokenPayload =>
  typeof value.id === 'string' || typeof value.id === 'number';

interface DecodedUser {
  userId?: string;
  userRole?: string;
  shelterId?: string;
}

const getUserFromToken = (token: string | null): DecodedUser => {
  if (!token) return {};
  try {
    // Explicitly specify algorithm to prevent algorithm confusion attacks
    const decoded = jwt.verify(token, keys.secretOrKey, { algorithms: ['HS256'] });
    if (!isJwtPayload(decoded)) return {};
    if (!isTokenPayload(decoded)) return {};
    return {
      userId: decoded.id?.toString(),
      userRole: decoded.userRole,
      shelterId: decoded.shelterId,
    };
  } catch {
    return {};
  }
};

export const createGraphQLContext = (req?: Request, authToken?: string): GraphQLContext => {
  const headerToken = req?.headers?.authorization;
  // Process authToken the same way as header token to normalize Bearer prefix
  const rawToken = authToken ?? headerToken;
  const token = getTokenFromHeader(rawToken);
  const { userId, userRole, shelterId } = getUserFromToken(token);
  return {
    loaders: createLoaders(),
    userId,
    userRole,
    shelterId,
  };
};
