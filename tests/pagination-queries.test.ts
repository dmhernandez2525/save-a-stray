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
interface MockNode {
  _id: {
    toString: () => string;
  };
}

interface QueryChain<T> {
  sort: (value: Record<string, 1 | -1>) => QueryChain<T>;
  limit: (value: number) => Promise<T[]>;
}

const animalFindMock = jest.fn<(filter: Record<string, unknown>) => QueryChain<MockNode>>();
const animalCountDocumentsMock = jest.fn<(filter: Record<string, unknown>) => Promise<number>>();
const applicationFindMock = jest.fn<(filter: Record<string, unknown>) => QueryChain<MockNode>>();
const applicationCountDocumentsMock =
  jest.fn<(filter: Record<string, unknown>) => Promise<number>>();
const shelterFindByIdMock = jest.fn<(id: string) => Promise<{ animals: string[] } | null>>();

jest.mock('mongoose', () => {
  const actual = jest.requireActual<typeof import('mongoose')>('mongoose');

  const modelMap: Record<string, unknown> = {
    animal: {
      find: (filter: Record<string, unknown>) => animalFindMock(filter),
      countDocuments: (filter: Record<string, unknown>) => animalCountDocumentsMock(filter),
    },
    application: {
      find: (filter: Record<string, unknown>) => applicationFindMock(filter),
      countDocuments: (filter: Record<string, unknown>) => applicationCountDocumentsMock(filter),
    },
    shelter: {
      findById: (id: string) => shelterFindByIdMock(id),
    },
  };

  return {
    ...actual,
    model: jest.fn((name: string) => modelMap[name] ?? {}),
  };
});

import { paginationQueryFields } from '../server/schema/types/pagination_queries';

const createNode = (id: string): MockNode => ({
  _id: {
    toString: () => id,
  },
});

const createQueryChain = <T>(results: T[]): QueryChain<T> => {
  const chain: QueryChain<T> = {
    sort: () => chain,
    limit: async () => results,
  };
  return chain;
};

interface AnimalsConnectionArgs {
  first?: number;
  after?: string;
  status?: string;
  type?: string;
  shelterId?: string;
}

interface ApplicationsConnectionArgs {
  first?: number;
  after?: string;
  status?: string;
  userId?: string;
  shelterId?: string;
}

interface ConnectionResult {
  edges: Array<{ cursor: string; node: MockNode }>;
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
  totalCount: number;
}

const getAnimalsResolver = (): ((
  source: unknown,
  args: AnimalsConnectionArgs
) => Promise<ConnectionResult>) => {
  const resolver = paginationQueryFields.animalsConnection.resolve;
  if (!resolver) {
    throw new Error('animalsConnection resolver is missing');
  }
  return resolver as (source: unknown, args: AnimalsConnectionArgs) => Promise<ConnectionResult>;
};

const getApplicationAliasResolver = (): ((
  source: unknown,
  args: ApplicationsConnectionArgs
) => Promise<ConnectionResult>) => {
  const resolver = paginationQueryFields.applicationConnectionById.resolve;
  if (!resolver) {
    throw new Error('applicationConnectionById resolver is missing');
  }
  return resolver as (
    source: unknown,
    args: ApplicationsConnectionArgs
  ) => Promise<ConnectionResult>;
};

describe('pagination query fields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cursor-based paginated animal results with totalCount', async () => {
    shelterFindByIdMock.mockResolvedValue({
      animals: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    });
    animalFindMock.mockReturnValue(
      createQueryChain([
        createNode('507f1f77bcf86cd799439013'),
        createNode('507f1f77bcf86cd799439012'),
        createNode('507f1f77bcf86cd799439011'),
      ])
    );
    animalCountDocumentsMock.mockResolvedValue(3);

    const result = await getAnimalsResolver()({}, { first: 2, shelterId: 'shelter-1' });

    expect(result.totalCount).toBe(3);
    expect(result.edges).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.pageInfo.endCursor).toBeDefined();
  });

  it('rejects invalid cursor values with BAD_USER_INPUT', async () => {
    await expect(
      getAnimalsResolver()({}, { first: 2, after: 'invalid-cursor' })
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('supports deprecated applicationConnectionById alias', async () => {
    shelterFindByIdMock.mockResolvedValue({
      animals: ['507f1f77bcf86cd799439011'],
    });
    applicationFindMock.mockReturnValue(
      createQueryChain([
        createNode('607f1f77bcf86cd799439011'),
        createNode('607f1f77bcf86cd799439012'),
      ])
    );
    applicationCountDocumentsMock.mockResolvedValue(2);

    const result = await getApplicationAliasResolver()(
      {},
      {
        first: 1,
        shelterId: 'shelter-1',
      }
    );

    expect(result.totalCount).toBe(2);
    expect(result.edges).toHaveLength(1);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });
});
