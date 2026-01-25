import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} from "graphql";

const OutcomeLogType = new GraphQLObjectType({
  name: "OutcomeLogType",
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    outcomeDate: { type: GraphQLString },
    outcomeType: { type: GraphQLString },
    destination: { type: GraphQLString },
    condition: { type: GraphQLString },
    outcomeNotes: { type: GraphQLString },
    processedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

export default OutcomeLogType;
