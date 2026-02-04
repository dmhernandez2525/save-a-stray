import { PubSub } from 'graphql-subscriptions';

type SubscriptionEvent =
  | 'APPLICATION_STATUS_CHANGED'
  | 'NEW_APPLICATION'
  | 'ANIMAL_STATUS_CHANGED';

export const SUBSCRIPTION_EVENTS: Record<SubscriptionEvent, SubscriptionEvent> = {
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  NEW_APPLICATION: 'NEW_APPLICATION',
  ANIMAL_STATUS_CHANGED: 'ANIMAL_STATUS_CHANGED',
};

// WARNING: In-memory PubSub does NOT work in multi-instance deployments.
// Each server instance will have its own PubSub, causing subscription events
// to only reach subscribers connected to the same instance.
// For production, use Redis PubSub: npm install graphql-redis-subscriptions ioredis
// Example:
//   import { RedisPubSub } from 'graphql-redis-subscriptions';
//   const pubsub = new RedisPubSub({ publisher: new Redis(...), subscriber: new Redis(...) });
if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
  console.warn(
    '[PubSub] WARNING: Using in-memory PubSub in production. ' +
    'Subscriptions will not work across multiple server instances. ' +
    'Configure REDIS_URL for distributed PubSub.'
  );
}

export const pubsub = new PubSub();
