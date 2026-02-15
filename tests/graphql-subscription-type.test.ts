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
import '../server/models';
import RootSubscriptionType from '../server/schema/types/root_subscription_type';

describe('root subscription type', () => {
  it('defines subscription fields', () => {
    const fields = RootSubscriptionType.getFields();
    expect(fields.applicationStatusChanged).toBeDefined();
    expect(fields.newApplication).toBeDefined();
    expect(fields.animalStatusChanged).toBeDefined();
  });
});
