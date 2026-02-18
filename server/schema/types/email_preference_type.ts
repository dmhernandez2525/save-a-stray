import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfigMap,
} from 'graphql';

interface EmailPreferenceParent {
  _id?: string;
  userId: string;
  applicationUpdates: boolean;
  statusChanges: boolean;
  newListings: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
  digestFrequency: string;
  unsubscribedAll: boolean;
  matchingPreferences: boolean;
  fosterUpdates: boolean;
  shelterNews: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailPreferenceType = new GraphQLObjectType({
  name: 'EmailPreferenceType',
  fields: (): GraphQLFieldConfigMap<EmailPreferenceParent, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    applicationUpdates: { type: GraphQLBoolean },
    statusChanges: { type: GraphQLBoolean },
    newListings: { type: GraphQLBoolean },
    eventReminders: { type: GraphQLBoolean },
    marketingEmails: { type: GraphQLBoolean },
    digestFrequency: { type: GraphQLString },
    unsubscribedAll: { type: GraphQLBoolean },
    matchingPreferences: { type: GraphQLBoolean },
    fosterUpdates: { type: GraphQLBoolean },
    shelterNews: { type: GraphQLBoolean },
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

export default EmailPreferenceType;
