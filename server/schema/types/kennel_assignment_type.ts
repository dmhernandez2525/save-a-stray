import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';

interface KennelAssignmentParent {
  _id?: string;
  shelterId?: string;
  kennelId?: string;
  kennelName?: string;
  animalId?: string;
  assignedAt?: Date;
  releasedAt?: Date;
  status?: string;
  notes?: string;
}

const KennelAssignmentType = new GraphQLObjectType({
  name: 'KennelAssignmentType',
  fields: (): GraphQLFieldConfigMap<KennelAssignmentParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    kennelId: { type: GraphQLString },
    kennelName: { type: GraphQLString },
    animalId: { type: GraphQLString },
    assignedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.assignedAt?.toISOString(); },
    },
    releasedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.releasedAt?.toISOString(); },
    },
    status: { type: GraphQLString },
    notes: { type: GraphQLString },
  }),
});

export default KennelAssignmentType;
