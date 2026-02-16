import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';

interface StaffInvitationParent {
  _id?: string;
  shelterId?: string;
  email?: string;
  role?: string;
  invitedBy?: string;
  status?: string;
  expiresAt?: Date;
  createdAt?: Date;
}

const StaffInvitationType = new GraphQLObjectType({
  name: 'StaffInvitationType',
  fields: (): GraphQLFieldConfigMap<StaffInvitationParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    invitedBy: { type: GraphQLString },
    status: { type: GraphQLString },
    expiresAt: {
      type: GraphQLString,
      resolve(parent) { return parent.expiresAt?.toISOString(); },
    },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default StaffInvitationType;
