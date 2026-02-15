import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from '@jest/globals';
jest.mock('../server/services/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { GraphQLError, GraphQLFormattedError } from 'graphql';
import '../server/models';
import { AuthorizationError } from '../server/graphql/authorization';
import { formatGraphQLError } from '../server/graphql/errors';

const createFormattedError = (
  message: string,
  extensions: Record<string, unknown> = {}
): GraphQLFormattedError => ({
  message,
  extensions,
});

describe('graphql error formatter', () => {
  it('maps authorization errors to FORBIDDEN', () => {
    const wrapped = new GraphQLError('Admin access required', {
      originalError: new AuthorizationError('Admin access required'),
    });

    const formatted = formatGraphQLError(createFormattedError('Admin access required'), wrapped);

    expect(formatted.extensions?.code).toBe('FORBIDDEN');
    expect(formatted.message).toBe('You do not have permission to perform this action.');
  });

  it('keeps BAD_USER_INPUT message text for actionable client feedback', () => {
    const formatted = formatGraphQLError(
      createFormattedError('Invalid email address.', { code: 'BAD_USER_INPUT' }),
      new GraphQLError('Invalid email address.')
    );

    expect(formatted.extensions?.code).toBe('BAD_USER_INPUT');
    expect(formatted.message).toBe('Invalid email address.');
  });

  it('masks unexpected server errors behind a safe message', () => {
    const formatted = formatGraphQLError(
      createFormattedError('Database timeout'),
      new GraphQLError('Database timeout')
    );

    expect(formatted.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
    expect(formatted.message).toBe('An unexpected error occurred. Please try again shortly.');
  });
});
