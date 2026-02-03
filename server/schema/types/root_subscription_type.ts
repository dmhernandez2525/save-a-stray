import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLFieldConfigMap,
} from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { ApplicationDocument } from '../../models/Application';
import { AnimalDocument } from '../../models/Animal';
import ApplicationType from './application_type';
import AnimalType from './animal_type';
import { pubsub, SUBSCRIPTION_EVENTS } from '../../graphql/pubsub';
import { GraphQLContext } from '../../graphql/context';

interface SubscriptionPayload {
  applicationStatusChanged?: ApplicationDocument;
  newApplication?: ApplicationDocument;
  newApplicationShelterId?: string;
  animalStatusChanged?: AnimalDocument;
}

interface ApplicationStatusArgs {
  applicationId: string;
}

interface NewApplicationArgs {
  shelterId: string;
}

interface AnimalStatusArgs {
  animalId: string;
}

const RootSubscriptionType = new GraphQLObjectType({
  name: 'RootSubscriptionType',
  fields: (): GraphQLFieldConfigMap<SubscriptionPayload, GraphQLContext> => ({
    applicationStatusChanged: {
      type: ApplicationType,
      args: { applicationId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter<SubscriptionPayload, ApplicationStatusArgs>(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.APPLICATION_STATUS_CHANGED),
        (payload, variables) =>
          payload.applicationStatusChanged?._id.toString() === variables.applicationId
      ),
      resolve: (payload) => payload.applicationStatusChanged ?? null,
    },
    newApplication: {
      type: ApplicationType,
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter<SubscriptionPayload, NewApplicationArgs>(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.NEW_APPLICATION),
        (payload, variables) => payload.newApplicationShelterId === variables.shelterId
      ),
      resolve: (payload) => payload.newApplication ?? null,
    },
    animalStatusChanged: {
      type: AnimalType,
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter<SubscriptionPayload, AnimalStatusArgs>(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED),
        (payload, variables) =>
          payload.animalStatusChanged?._id.toString() === variables.animalId
      ),
      resolve: (payload) => payload.animalStatusChanged ?? null,
    },
  }),
});

export default RootSubscriptionType;
