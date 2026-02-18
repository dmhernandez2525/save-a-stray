import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from 'graphql';

const TwoFactorSetupType = new GraphQLObjectType({
  name: 'TwoFactorSetupType',
  fields: () => ({
    secret: { type: GraphQLString },
    uri: { type: GraphQLString },
    backupCodes: { type: new GraphQLList(GraphQLString) },
  }),
});

export default TwoFactorSetupType;
