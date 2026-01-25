import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} from 'graphql';

const IntakeLogType = new GraphQLObjectType({
  name: 'IntakeLogType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    intakeDate: { type: GraphQLString },
    intakeType: { type: GraphQLString },
    source: { type: GraphQLString },
    condition: { type: GraphQLString },
    intakeNotes: { type: GraphQLString },
    receivedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default IntakeLogType;
