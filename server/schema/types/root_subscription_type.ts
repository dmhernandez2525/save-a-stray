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
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.APPLICATION_STATUS_CHANGED),
        (payload: SubscriptionPayload, variables: ApplicationStatusArgs) =>
          payload.applicationStatusChanged?._id.toString() === variables.applicationId
      ),
      resolve: (payload: SubscriptionPayload) => payload.applicationStatusChanged ?? null,
    },
    newApplication: {
      type: ApplicationType,
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.NEW_APPLICATION),
        (payload: SubscriptionPayload, variables: NewApplicationArgs) =>
          payload.newApplicationShelterId === variables.shelterId
      ),
      resolve: (payload: SubscriptionPayload) => payload.newApplication ?? null,
    },
    animalStatusChanged: {
      type: AnimalType,
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED),
        (payload: SubscriptionPayload, variables: AnimalStatusArgs) =>
          payload.animalStatusChanged?._id.toString() === variables.animalId
      ),
      resolve: (payload: SubscriptionPayload) => payload.animalStatusChanged ?? null,
    },
  }),
});

export default RootSubscriptionType;
