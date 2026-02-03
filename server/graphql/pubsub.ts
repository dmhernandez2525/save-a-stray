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

export const pubsub = new PubSub();
