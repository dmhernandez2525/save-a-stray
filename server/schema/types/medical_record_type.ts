import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap
} from 'graphql';

const MedicalRecordType: GraphQLObjectType = new GraphQLObjectType({
  name: "MedicalRecordType",
  fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
    _id: { type: GraphQLID },
    date: { type: GraphQLString },
    recordType: { type: GraphQLString },
    description: { type: GraphQLString },
    veterinarian: { type: GraphQLString }
  })
});

export default MedicalRecordType;
