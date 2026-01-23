import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFieldConfigMap
} from 'graphql';

const ReviewType: GraphQLObjectType = new GraphQLObjectType({
  name: "ReviewType",
  fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    rating: { type: GraphQLInt },
    comment: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default ReviewType;
