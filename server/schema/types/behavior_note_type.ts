import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';

const BehaviorNoteType = new GraphQLObjectType({
  name: 'BehaviorNoteType',
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    noteType: { type: GraphQLString },
    content: { type: GraphQLString },
    author: { type: GraphQLString },
    severity: { type: GraphQLString },
    resolved: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString }
  })
});

export default BehaviorNoteType;
