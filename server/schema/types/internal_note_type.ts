import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';

interface InternalNoteParent {
  _id?: string;
  shelterId?: string;
  entityType?: string;
  entityId?: string;
  content?: string;
  author?: string;
  createdAt?: Date;
}

const InternalNoteType = new GraphQLObjectType({
  name: 'InternalNoteType',
  fields: (): GraphQLFieldConfigMap<InternalNoteParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    entityType: { type: GraphQLString },
    entityId: { type: GraphQLString },
    content: { type: GraphQLString },
    author: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default InternalNoteType;
