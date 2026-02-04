import { pubsub, SUBSCRIPTION_EVENTS } from '../server/graphql/pubsub';

describe('graphql pubsub', () => {
  it('exposes subscription event names', () => {
    expect(SUBSCRIPTION_EVENTS.APPLICATION_STATUS_CHANGED).toBe('APPLICATION_STATUS_CHANGED');
    expect(SUBSCRIPTION_EVENTS.NEW_APPLICATION).toBe('NEW_APPLICATION');
    expect(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED).toBe('ANIMAL_STATUS_CHANGED');
  });

  it('creates a pubsub instance', () => {
    expect(pubsub).toBeDefined();
  });
});
