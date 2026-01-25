import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean
} from 'graphql';

const AdoptionFeeType = new GraphQLObjectType({
  name: 'AdoptionFeeType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    currency: { type: GraphQLString },
    description: { type: GraphQLString },
    waived: { type: GraphQLBoolean },
    waivedReason: { type: GraphQLString },
    paidAt: { type: GraphQLString },
    paidBy: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default AdoptionFeeType;
