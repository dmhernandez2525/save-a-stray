import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface ShelterStaffRoleParent {
  _id?: string;
  shelterId?: string;
  userId?: string;
  role?: string;
  assignedAnimals?: string[];
  assignedBy?: string;
  createdAt?: Date;
}

const ShelterStaffRoleType = new GraphQLObjectType({
  name: 'ShelterStaffRoleType',
  fields: (): GraphQLFieldConfigMap<ShelterStaffRoleParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    userId: { type: GraphQLString },
    role: { type: GraphQLString },
    assignedAnimals: { type: new GraphQLList(GraphQLString) },
    assignedBy: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default ShelterStaffRoleType;
