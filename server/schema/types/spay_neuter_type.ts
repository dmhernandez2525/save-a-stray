import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} from 'graphql';

const SpayNeuterType = new GraphQLObjectType({
  name: 'SpayNeuterType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    procedureType: { type: GraphQLString },
    status: { type: GraphQLString },
    scheduledDate: { type: GraphQLString },
    completedDate: { type: GraphQLString },
    veterinarian: { type: GraphQLString },
    clinic: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default SpayNeuterType;
