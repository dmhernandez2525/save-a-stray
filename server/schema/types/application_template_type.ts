import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLBoolean } from 'graphql';

const TemplateFieldType = new GraphQLObjectType({
  name: 'TemplateFieldType',
  fields: () => ({
    label: { type: GraphQLString },
    fieldType: { type: GraphQLString },
    required: { type: GraphQLBoolean },
    options: { type: new GraphQLList(GraphQLString) },
    placeholder: { type: GraphQLString },
    helpText: { type: GraphQLString },
  })
});

const ApplicationTemplateType = new GraphQLObjectType({
  name: 'ApplicationTemplateType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    name: { type: GraphQLString },
    animalType: { type: GraphQLString },
    fields: { type: new GraphQLList(TemplateFieldType) },
    active: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
  })
});

export default ApplicationTemplateType;
