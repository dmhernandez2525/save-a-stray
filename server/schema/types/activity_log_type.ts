import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';

const ActivityLogType = new GraphQLObjectType({
  name: 'ActivityLogType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    action: { type: GraphQLString },
    entityType: { type: GraphQLString },
    entityId: { type: GraphQLString },
    description: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default ActivityLogType;
