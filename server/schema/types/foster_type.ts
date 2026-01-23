import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';

const FosterType = new GraphQLObjectType({
  name: 'FosterType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    animalId: { type: GraphQLString },
    userId: { type: GraphQLString },
    fosterName: { type: GraphQLString },
    fosterEmail: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    status: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default FosterType;
