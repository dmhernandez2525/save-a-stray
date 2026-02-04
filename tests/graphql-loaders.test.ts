import DataLoader from 'dataloader';
import { createLoaders, filterLoaderResults } from '../server/graphql/loaders';

describe('graphql loaders', () => {
  it('creates DataLoader instances', () => {
    const loaders = createLoaders();
    expect(loaders.animalById).toBeInstanceOf(DataLoader);
    expect(loaders.applicationById).toBeInstanceOf(DataLoader);
    expect(loaders.shelterById).toBeInstanceOf(DataLoader);
    expect(loaders.userById).toBeInstanceOf(DataLoader);
  });

  it('filters out errors from loader results', () => {
    const results = filterLoaderResults<number | Error>([1, new Error('fail'), 2]);
    expect(results).toEqual([1, 2]);
  });
});
