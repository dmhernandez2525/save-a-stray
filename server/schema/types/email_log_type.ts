import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface EmailLogParent {
  _id?: string;
  userId: string;
  shelterId: string;
  templateName: string;
  subject: string;
  recipientEmail: string;
  category: string;
  status: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  errorMessage: string;
  metadata: Map<string, string>;
  createdAt: Date;
}

const EmailMetadataEntryType = new GraphQLObjectType({
  name: 'EmailMetadataEntryType',
  fields: {
    key: { type: GraphQLString },
    value: { type: GraphQLString },
  },
});

const EmailLogType = new GraphQLObjectType({
  name: 'EmailLogType',
  fields: (): GraphQLFieldConfigMap<EmailLogParent, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    templateName: { type: GraphQLString },
    subject: { type: GraphQLString },
    recipientEmail: { type: GraphQLString },
    category: { type: GraphQLString },
    status: { type: GraphQLString },
    sentAt: {
      type: GraphQLString,
      resolve(parent) { return parent.sentAt?.toISOString(); },
    },
    openedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.openedAt?.toISOString(); },
    },
    clickedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.clickedAt?.toISOString(); },
    },
    bouncedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.bouncedAt?.toISOString(); },
    },
    errorMessage: { type: GraphQLString },
    metadata: {
      type: new GraphQLList(EmailMetadataEntryType),
      resolve(parent) {
        if (!parent.metadata) return [];
        const entries: { key: string; value: string }[] = [];
        parent.metadata.forEach((value: string, key: string) => {
          entries.push({ key, value });
        });
        return entries;
      },
    },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default EmailLogType;
