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

interface MockDoc {
  _id: {
    toString: () => string;
  };
}

const animalFindMock = jest.fn<(filter: Record<string, unknown>) => Promise<MockDoc[]>>();
const applicationFindMock = jest.fn<(filter: Record<string, unknown>) => Promise<unknown[]>>();
const shelterFindMock = jest.fn<(filter: Record<string, unknown>) => Promise<unknown[]>>();
const userFindMock = jest.fn<(filter: Record<string, unknown>) => Promise<unknown[]>>();

jest.mock('mongoose', () => {
  const actual = jest.requireActual<typeof import('mongoose')>('mongoose');

  const modelMap: Record<string, unknown> = {
    animal: {
      find: (filter: Record<string, unknown>) => animalFindMock(filter),
    },
    application: {
      find: (filter: Record<string, unknown>) => applicationFindMock(filter),
    },
    shelter: {
      find: (filter: Record<string, unknown>) => shelterFindMock(filter),
    },
    user: {
      find: (filter: Record<string, unknown>) => userFindMock(filter),
    },
  };

  return {
    ...actual,
    model: jest.fn((name: string) => modelMap[name] ?? {}),
  };
});

import DataLoader from 'dataloader';
import { createLoaders, filterLoaderResults } from '../server/graphql/loaders';

const createDoc = (id: string): MockDoc => ({
  _id: {
    toString: () => id,
  },
});

describe('graphql loaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applicationFindMock.mockResolvedValue([]);
    shelterFindMock.mockResolvedValue([]);
    userFindMock.mockResolvedValue([]);
  });

  it('creates DataLoader instances', () => {
    const loaders = createLoaders();
    expect(loaders.animalById).toBeInstanceOf(DataLoader);
    expect(loaders.applicationById).toBeInstanceOf(DataLoader);
    expect(loaders.shelterById).toBeInstanceOf(DataLoader);
    expect(loaders.userById).toBeInstanceOf(DataLoader);
  });

  it('batches id lookups into a single animal query', async () => {
    animalFindMock.mockResolvedValue([createDoc('a1'), createDoc('a2')]);
    const loaders = createLoaders();

    const [first, second] = await Promise.all([
      loaders.animalById.load('a1'),
      loaders.animalById.load('a2'),
    ]);

    expect(animalFindMock).toHaveBeenCalledTimes(1);
    expect(animalFindMock).toHaveBeenCalledWith({ _id: { $in: ['a1', 'a2'] } });
    expect(first?._id.toString()).toBe('a1');
    expect(second?._id.toString()).toBe('a2');
  });

  it('filters out errors from loader results', () => {
    const results = filterLoaderResults<number | Error>([1, new Error('fail'), 2]);
    expect(results).toEqual([1, 2]);
  });
});
