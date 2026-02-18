import { unwrapResolverError } from '@apollo/server/errors';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { AuthorizationError } from './authorization';
import { logger } from '../services/logger';

type KnownErrorCode =
  | 'BAD_USER_INPUT'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'QUERY_COMPLEXITY_LIMIT_EXCEEDED'
  | 'QUERY_DEPTH_LIMIT_EXCEEDED'
  | 'UNAUTHENTICATED';

interface ErrorExtensionsShape {
  code?: string;
  [key: string]: unknown;
}

const USER_MESSAGE_BY_CODE: Record<KnownErrorCode, string> = {
  BAD_USER_INPUT: 'Request validation failed. Review the input values and try again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again shortly.',
  QUERY_COMPLEXITY_LIMIT_EXCEEDED:
    'Query is too expensive. Request fewer fields or lower the page size.',
  QUERY_DEPTH_LIMIT_EXCEEDED: 'Query is too deeply nested. Reduce nesting and retry.',
  UNAUTHENTICATED: 'Authentication required. Please sign in and try again.',
};

const BAD_USER_INPUT_PATTERNS: RegExp[] = [
  /\binvalid\b/i,
  /\brequired\b/i,
  /\bmissing\b/i,
  /\balready\b/i,
  /\bmust\b/i,
  /\bcannot\b/i,
  /\bexceeds?\b/i,
  /\btaken\b/i,
  /\bnot found\b/i,
];

const isAuthenticationMessage = (message: string): boolean =>
  /\bauthentication\b/i.test(message) || /\blogged in\b/i.test(message);

const inferErrorCode = (
  formattedError: GraphQLFormattedError,
  originalError: unknown
): KnownErrorCode => {
  const extensions = (formattedError.extensions ?? {}) as ErrorExtensionsShape;
  const extensionCode = extensions.code;
  if (
    extensionCode === 'BAD_USER_INPUT' ||
    extensionCode === 'FORBIDDEN' ||
    extensionCode === 'QUERY_COMPLEXITY_LIMIT_EXCEEDED' ||
    extensionCode === 'QUERY_DEPTH_LIMIT_EXCEEDED' ||
    extensionCode === 'UNAUTHENTICATED'
  ) {
    return extensionCode;
  }

  if (
    originalError instanceof AuthorizationError ||
    (originalError instanceof Error && originalError.name === 'AuthorizationError')
  ) {
    return isAuthenticationMessage(formattedError.message) ? 'UNAUTHENTICATED' : 'FORBIDDEN';
  }

  if (
    /\bpermission\b/i.test(formattedError.message) ||
    /\badmin access\b/i.test(formattedError.message)
  ) {
    return 'FORBIDDEN';
  }

  if (BAD_USER_INPUT_PATTERNS.some((pattern) => pattern.test(formattedError.message))) {
    return 'BAD_USER_INPUT';
  }

  return 'INTERNAL_SERVER_ERROR';
};

const sanitizeExtensions = (
  extensions: GraphQLFormattedError['extensions'],
  code: KnownErrorCode
): GraphQLFormattedError['extensions'] => {
  const safeExtensions: Record<string, unknown> = {
    code,
  };

  if (extensions) {
    for (const [key, value] of Object.entries(extensions)) {
      if (key === 'stacktrace' || key === 'exception') {
        continue;
      }
      safeExtensions[key] = value;
    }
  }

  return safeExtensions;
};

const logFormattedError = (
  code: KnownErrorCode,
  formattedError: GraphQLFormattedError,
  originalError: unknown
): void => {
  const errorPath = formattedError.path?.join('.') ?? 'unknown';
  const sourceMessage =
    originalError instanceof Error ? originalError.message : formattedError.message;

  if (code === 'INTERNAL_SERVER_ERROR') {
    logger.error('graphql_internal_error', {
      code,
      path: errorPath,
      message: sourceMessage,
    });
    return;
  }

  if (code === 'QUERY_DEPTH_LIMIT_EXCEEDED' || code === 'QUERY_COMPLEXITY_LIMIT_EXCEEDED') {
    logger.warn('graphql_query_rejected', {
      code,
      path: errorPath,
      message: sourceMessage,
    });
  }
};

export const formatGraphQLError = (
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError => {
  const resolverError = error instanceof GraphQLError ? unwrapResolverError(error) : undefined;
  const originalError =
    resolverError ?? (error instanceof GraphQLError ? error.originalError : undefined);
  const code = inferErrorCode(formattedError, originalError);
  const message = code === 'BAD_USER_INPUT' ? formattedError.message : USER_MESSAGE_BY_CODE[code];

  logFormattedError(code, formattedError, originalError);

  return {
    ...formattedError,
    message,
    extensions: sanitizeExtensions(formattedError.extensions, code),
  };
};
