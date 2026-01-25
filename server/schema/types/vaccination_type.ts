import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} from 'graphql';

const VaccinationType = new GraphQLObjectType({
  name: 'VaccinationType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    vaccineName: { type: GraphQLString },
    batchNumber: { type: GraphQLString },
    administeredBy: { type: GraphQLString },
    administeredDate: { type: GraphQLString },
    expirationDate: { type: GraphQLString },
    status: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default VaccinationType;
