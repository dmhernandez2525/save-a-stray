import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} from 'graphql';

const WaitlistType = new GraphQLObjectType({
  name: 'WaitlistType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    userId: { type: GraphQLString },
    userName: { type: GraphQLString },
    userEmail: { type: GraphQLString },
    userPhone: { type: GraphQLString },
    position: { type: GraphQLInt },
    status: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default WaitlistType;
