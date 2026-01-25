import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLFloat } from 'graphql';

const DonationType = new GraphQLObjectType({
  name: 'DonationType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    userId: { type: GraphQLString },
    donorName: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    message: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default DonationType;
