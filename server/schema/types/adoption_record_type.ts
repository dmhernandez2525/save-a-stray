import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface FollowUpParent {
  _id?: string;
  type: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: string;
  notes: string;
}

interface AdoptionRecordParent {
  _id?: string;
  animalId: string;
  adopterId: string;
  shelterId: string;
  applicationId: string;
  adoptionDate: Date;
  feeAmount: number;
  feeStatus: string;
  paymentIntentId: string;
  contractUrl: string;
  contractSignedAt?: Date;
  certificateUrl: string;
  followUps: FollowUpParent[];
  returnDate?: Date;
  returnReason?: string;
  notes: string;
  createdAt: Date;
}

const FollowUpType = new GraphQLObjectType({
  name: 'FollowUpType',
  fields: (): GraphQLFieldConfigMap<FollowUpParent, unknown> => ({
    _id: { type: GraphQLID },
    type: { type: GraphQLString },
    scheduledDate: {
      type: GraphQLString,
      resolve(parent) { return parent.scheduledDate?.toISOString(); },
    },
    completedDate: {
      type: GraphQLString,
      resolve(parent) { return parent.completedDate?.toISOString(); },
    },
    status: { type: GraphQLString },
    notes: { type: GraphQLString },
  }),
});

const AdoptionRecordType = new GraphQLObjectType({
  name: 'AdoptionRecordType',
  fields: (): GraphQLFieldConfigMap<AdoptionRecordParent, unknown> => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    adopterId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    applicationId: { type: GraphQLString },
    adoptionDate: {
      type: GraphQLString,
      resolve(parent) { return parent.adoptionDate?.toISOString(); },
    },
    feeAmount: { type: GraphQLFloat },
    feeStatus: { type: GraphQLString },
    paymentIntentId: { type: GraphQLString },
    contractUrl: { type: GraphQLString },
    contractSignedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.contractSignedAt?.toISOString(); },
    },
    certificateUrl: { type: GraphQLString },
    followUps: { type: new GraphQLList(FollowUpType) },
    returnDate: {
      type: GraphQLString,
      resolve(parent) { return parent.returnDate?.toISOString(); },
    },
    returnReason: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default AdoptionRecordType;
