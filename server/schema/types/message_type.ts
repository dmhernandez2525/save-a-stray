import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface MessageAttachmentParent {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface MessageParent {
  _id?: string;
  senderId: string;
  recipientId: string;
  shelterId: string;
  threadId: string;
  animalId: string;
  content: string;
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  attachments: MessageAttachmentParent[];
  templateId: string;
  archived: boolean;
  createdAt: Date;
}

const MessageAttachmentType = new GraphQLObjectType({
  name: 'MessageAttachmentType',
  fields: (): GraphQLFieldConfigMap<MessageAttachmentParent, unknown> => ({
    url: { type: GraphQLString },
    filename: { type: GraphQLString },
    mimeType: { type: GraphQLString },
    size: { type: GraphQLInt },
  }),
});

const MessageType = new GraphQLObjectType({
  name: 'MessageType',
  fields: (): GraphQLFieldConfigMap<MessageParent, unknown> => ({
    _id: { type: GraphQLID },
    senderId: { type: GraphQLString },
    recipientId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    threadId: { type: GraphQLString },
    animalId: { type: GraphQLString },
    content: { type: GraphQLString },
    read: { type: GraphQLBoolean },
    readAt: {
      type: GraphQLString,
      resolve(parent) { return parent.readAt?.toISOString(); },
    },
    delivered: { type: GraphQLBoolean },
    deliveredAt: {
      type: GraphQLString,
      resolve(parent) { return parent.deliveredAt?.toISOString(); },
    },
    attachments: { type: new GraphQLList(MessageAttachmentType) },
    templateId: { type: GraphQLString },
    archived: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
  }),
});

export default MessageType;
