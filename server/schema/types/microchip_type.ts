import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} from 'graphql';

const MicrochipType = new GraphQLObjectType({
  name: 'MicrochipType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    chipNumber: { type: GraphQLString },
    chipBrand: { type: GraphQLString },
    registeredDate: { type: GraphQLString },
    registeredBy: { type: GraphQLString },
    status: { type: GraphQLString },
    ownerName: { type: GraphQLString },
    ownerPhone: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default MicrochipType;
