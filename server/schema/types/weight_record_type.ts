import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
} from "graphql";

const WeightRecordType = new GraphQLObjectType({
  name: "WeightRecordType",
  fields: () => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    weight: { type: GraphQLFloat },
    unit: { type: GraphQLString },
    recordedAt: { type: GraphQLString },
    recordedBy: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

export default WeightRecordType;
