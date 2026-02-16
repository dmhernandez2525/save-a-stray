import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';

interface StatusHistoryParent {
  _id?: string;
  animalId?: string;
  fromStatus?: string;
  toStatus?: string;
  changedBy?: string;
  reason?: string;
  createdAt?: Date;
}

const StatusHistoryType = new GraphQLObjectType({
  name: 'StatusHistoryType',
  fields: (): GraphQLFieldConfigMap<StatusHistoryParent, unknown> => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    fromStatus: { type: GraphQLString },
    toStatus: { type: GraphQLString },
    changedBy: { type: GraphQLString },
    reason: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) {
        return parent.createdAt?.toISOString();
      },
    },
  }),
});

export default StatusHistoryType;
