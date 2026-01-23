import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';

const TerminalReaderType = new GraphQLObjectType({
  name: 'TerminalReaderType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    stripeReaderId: { type: GraphQLString },
    label: { type: GraphQLString },
    deviceType: { type: GraphQLString },
    serialNumber: { type: GraphQLString },
    location: { type: GraphQLString },
    status: { type: GraphQLString },
    registeredAt: { type: GraphQLString }
  })
});

export default TerminalReaderType;
