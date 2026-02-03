import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLFieldConfigMap,
} from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { ApplicationDocument } from '../../models/Application';
import { AnimalDocument } from '../../models/Animal';
import Shelter from '../../models/Shelter';
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

// Helper to check if user is authenticated
const requireAuth = (context: GraphQLContext): void => {
  if (!context.userId) {
    throw new Error('Authentication required for subscriptions');
  }
};

// Helper to check if user is associated with shelter (staff/admin)
const isShelterStaff = async (userId: string, shelterId: string): Promise<boolean> => {
  const shelter = await Shelter.findById(shelterId);
  if (!shelter) return false;
  // Check if user is in the shelter's users array
  const userIds = shelter.users?.map((u) => u.toString()) ?? [];
  return userIds.includes(userId);
};

const RootSubscriptionType = new GraphQLObjectType({
  name: 'RootSubscriptionType',
  fields: (): GraphQLFieldConfigMap<SubscriptionPayload, GraphQLContext> => ({
    applicationStatusChanged: {
      type: ApplicationType,
      args: { applicationId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        (_parent: unknown, _args: unknown, context: GraphQLContext) => {
          requireAuth(context);
          return pubsub.asyncIterator(SUBSCRIPTION_EVENTS.APPLICATION_STATUS_CHANGED);
        },
        async (payload: SubscriptionPayload, variables: ApplicationStatusArgs, context: GraphQLContext) => {
          const app = payload.applicationStatusChanged;
          if (!app) return false;
          if (app._id.toString() !== variables.applicationId) return false;

          // Only allow if user owns this application or is shelter staff
          const applicantId = app.userId?.toString();
          if (applicantId === context.userId) return true;

          // Check if user is shelter staff for the animal's shelter
          const shelter = await Shelter.findOne({ animals: app.animalId });
          if (shelter && context.userId) {
            return isShelterStaff(context.userId, shelter._id.toString());
          }
          return false;
        }
      ),
      resolve: (payload: SubscriptionPayload) => payload.applicationStatusChanged ?? null,
    },
    newApplication: {
      type: ApplicationType,
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        (_parent: unknown, _args: unknown, context: GraphQLContext) => {
          requireAuth(context);
          return pubsub.asyncIterator(SUBSCRIPTION_EVENTS.NEW_APPLICATION);
        },
        async (payload: SubscriptionPayload, variables: NewApplicationArgs, context: GraphQLContext) => {
          if (payload.newApplicationShelterId !== variables.shelterId) return false;

          // Only shelter staff can receive new application notifications
          if (!context.userId) return false;
          return isShelterStaff(context.userId, variables.shelterId);
        }
      ),
      resolve: (payload: SubscriptionPayload) => payload.newApplication ?? null,
    },
    animalStatusChanged: {
      type: AnimalType,
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        (_parent: unknown, _args: unknown, context: GraphQLContext) => {
          requireAuth(context);
          return pubsub.asyncIterator(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED);
        },
        (payload: SubscriptionPayload, variables: AnimalStatusArgs) =>
          payload.animalStatusChanged?._id.toString() === variables.animalId
      ),
      resolve: (payload: SubscriptionPayload) => payload.animalStatusChanged ?? null,
    },
  }),
});

export default RootSubscriptionType;
