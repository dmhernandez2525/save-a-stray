import { PubSub } from 'graphql-subscriptions';
import { logger } from '../services/logger';

type SubscriptionEvent = 'APPLICATION_STATUS_CHANGED' | 'NEW_APPLICATION' | 'ANIMAL_STATUS_CHANGED';

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
  logger.warn('in_memory_pubsub_in_production', {
    message:
      'Using in-memory PubSub in production. Subscriptions will not work across ' +
      'multiple server instances without REDIS_URL.',
  });
}

export const pubsub = new PubSub();
