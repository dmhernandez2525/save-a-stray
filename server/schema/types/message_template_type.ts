import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface MessageTemplateParent {
  _id?: string;
  shelterId: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageTemplateType = new GraphQLObjectType({
  name: 'MessageTemplateType',
  fields: (): GraphQLFieldConfigMap<MessageTemplateParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    name: { type: GraphQLString },
    category: { type: GraphQLString },
    subject: { type: GraphQLString },
    body: { type: GraphQLString },
    variables: { type: new GraphQLList(GraphQLString) },
    isActive: { type: GraphQLBoolean },
    usageCount: { type: GraphQLInt },
    createdBy: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
    updatedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.updatedAt?.toISOString(); },
    },
  }),
});

export default MessageTemplateType;
