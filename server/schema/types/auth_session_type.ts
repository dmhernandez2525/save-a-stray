import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';

interface AuthSessionParent {
  _id?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

const AuthSessionType = new GraphQLObjectType({
  name: 'AuthSessionType',
  fields: (): GraphQLFieldConfigMap<AuthSessionParent, unknown> => ({
    _id: { type: GraphQLID },
    deviceFingerprint: { type: GraphQLString },
    userAgent: { type: GraphQLString },
    ipAddress: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) {
        return parent.createdAt?.toISOString();
      },
    },
    lastUsedAt: {
      type: GraphQLString,
      resolve(parent) {
        return parent.lastUsedAt?.toISOString();
      },
    },
    expiresAt: {
      type: GraphQLString,
      resolve(parent) {
        return parent.expiresAt?.toISOString();
      },
    },
  }),
});

export default AuthSessionType;
