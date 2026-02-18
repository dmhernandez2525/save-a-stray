import { Types } from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLFieldConfigMap
} from 'graphql';
import { GraphQLContext } from '../../graphql/context';
import { filterLoaderResults } from '../../graphql/loaders';

interface ShelterParentValue {
  _id: string;
  name: string;
  location: string;
  coordinates?: { type: string; coordinates: [number, number] };
  paymentEmail: string;
  animals?: Array<string | Types.ObjectId>;
  users?: Array<string | Types.ObjectId>;
}

const ShelterType: GraphQLObjectType = new GraphQLObjectType({
  name: "ShelterType",
  fields: (): GraphQLFieldConfigMap<ShelterParentValue, GraphQLContext> => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    paymentEmail: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    website: { type: GraphQLString },
    hours: { type: GraphQLString },
    description: { type: GraphQLString },
    latitude: {
      type: GraphQLFloat,
      resolve(parent: ShelterParentValue) {
        return parent.coordinates?.coordinates?.[1] ?? null;
      },
    },
    longitude: {
      type: GraphQLFloat,
      resolve(parent: ShelterParentValue) {
        return parent.coordinates?.coordinates?.[0] ?? null;
      },
    },
    maxCapacity: { type: GraphQLInt },
    animalIdPrefix: { type: GraphQLString },
    verified: { type: GraphQLBoolean },
    verifiedAt: { type: GraphQLString },
    animals: {
      type: new GraphQLList(require("./animal_type").default),
      async resolve(parentValue: ShelterParentValue, _args, context: GraphQLContext) {
        const animalIds = parentValue.animals?.map((id) => id.toString()) ?? [];
        if (animalIds.length === 0) return [];
        const results = await context.loaders.animalById.loadMany(animalIds);
        return filterLoaderResults(results);
      }
    },
    users: {
      type: new GraphQLList(require("./user_type").default),
      async resolve(parentValue: ShelterParentValue, _args, context: GraphQLContext) {
        const userIds = parentValue.users?.map((id) => id.toString()) ?? [];
        if (userIds.length === 0) return [];
        const results = await context.loaders.userById.loadMany(userIds);
        return filterLoaderResults(results);
      }
    }
  })
});

export default ShelterType;
