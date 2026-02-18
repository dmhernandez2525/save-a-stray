import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface UnreadEntryParent {
  key: string;
  value: number;
}

interface MessageThreadParent {
  _id?: string;
  shelterId: string;
  participants: string[];
  animalId: string;
  subject: string;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: Map<string, number>;
  status: string;
  assignedTo: string;
  routingCategory: string;
  createdAt: Date;
}

const UnreadCountEntryType = new GraphQLObjectType({
  name: 'UnreadCountEntryType',
  fields: {
    userId: { type: GraphQLString },
    count: { type: GraphQLInt },
  },
});

const MessageThreadType = new GraphQLObjectType({
  name: 'MessageThreadType',
  fields: (): GraphQLFieldConfigMap<MessageThreadParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    participants: { type: new GraphQLList(GraphQLString) },
    animalId: { type: GraphQLString },
    subject: { type: GraphQLString },
    lastMessageAt: {
      type: GraphQLString,
      resolve(parent) { return parent.lastMessageAt?.toISOString(); },
    },
    lastMessagePreview: { type: GraphQLString },
    unreadCount: {
      type: new GraphQLList(UnreadCountEntryType),
      resolve(parent) {
        if (!parent.unreadCount) return [];
        const entries: { userId: string; count: number }[] = [];
        parent.unreadCount.forEach((count: number, userId: string) => {
          entries.push({ userId, count });
        });
        return entries;
      },
    },
    status: { type: GraphQLString },
    assignedTo: { type: GraphQLString },
    routingCategory: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default MessageThreadType;
