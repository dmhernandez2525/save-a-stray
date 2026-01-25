import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfigMap
} from 'graphql';

const NotificationType: GraphQLObjectType = new GraphQLObjectType({
  name: "NotificationType",
  fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    message: { type: GraphQLString },
    type: { type: GraphQLString },
    read: { type: GraphQLBoolean },
    link: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default NotificationType;
