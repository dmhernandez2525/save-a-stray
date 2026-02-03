describe('graphql context', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SECRET_OR_KEY;

  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.SECRET_OR_KEY = 'test-secret';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.SECRET_OR_KEY = originalSecret;
  });

  it('extracts userId from bearer token', async () => {
    const jwt = await import('jsonwebtoken');
    const { createGraphQLContext } = await import('../server/graphql/context');

    const secret = process.env.SECRET_OR_KEY;
    if (!secret) {
      throw new Error('Missing SECRET_OR_KEY for test');
    }
    const token = jwt.sign({ id: 'user-123' }, secret);
    const context = createGraphQLContext(undefined, `Bearer ${token}`);
    expect(context.userId).toBe('user-123');
  });

  it('returns undefined userId when token is invalid', async () => {
    const { createGraphQLContext } = await import('../server/graphql/context');
    const context = createGraphQLContext(undefined, 'Bearer invalid.token.value');
    expect(context.userId).toBeUndefined();
  });
});
