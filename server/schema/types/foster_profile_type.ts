import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';

interface HousingDetailParent {
  type: string;
  ownershipStatus: string;
  hasYard: boolean;
  yardFenced: boolean;
  squareFootage: number;
  landlordApproval: boolean;
  landlordContact: string;
  verificationStatus: string;
  verificationNotes: string;
  documentUrls: string[];
}

interface PetExperienceParent {
  _id?: string;
  animalType: string;
  years: number;
  description: string;
  isFosterExperience: boolean;
}

interface ReferenceParent {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  requestSentAt?: Date;
  responseReceivedAt?: Date;
  status: string;
  rating?: number;
  comments: string;
}

interface OrientationItemParent {
  _id?: string;
  module: string;
  completedAt?: Date;
  required: boolean;
}

interface FosterProfileParent {
  _id?: string;
  userId: string;
  shelterId: string;
  bio: string;
  photoUrl: string;
  maxAnimals: number;
  acceptedAnimalTypes: string[];
  specialSkills: string[];
  housing: HousingDetailParent;
  experience: PetExperienceParent[];
  references: ReferenceParent[];
  orientation: OrientationItemParent[];
  agreementSignedAt?: Date;
  agreementUrl: string;
  status: string;
  statusReason: string;
  backgroundCheckStatus: string;
  backgroundCheckDate?: Date;
  totalAnimalsHelped: number;
  currentAnimalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const HousingDetailType = new GraphQLObjectType({
  name: 'HousingDetailType',
  fields: (): GraphQLFieldConfigMap<HousingDetailParent, unknown> => ({
    type: { type: GraphQLString },
    ownershipStatus: { type: GraphQLString },
    hasYard: { type: GraphQLBoolean },
    yardFenced: { type: GraphQLBoolean },
    squareFootage: { type: GraphQLInt },
    landlordApproval: { type: GraphQLBoolean },
    landlordContact: { type: GraphQLString },
    verificationStatus: { type: GraphQLString },
    verificationNotes: { type: GraphQLString },
    documentUrls: { type: new GraphQLList(GraphQLString) },
  }),
});

const PetExperienceType = new GraphQLObjectType({
  name: 'PetExperienceType',
  fields: (): GraphQLFieldConfigMap<PetExperienceParent, unknown> => ({
    _id: { type: GraphQLID },
    animalType: { type: GraphQLString },
    years: { type: GraphQLInt },
    description: { type: GraphQLString },
    isFosterExperience: { type: GraphQLBoolean },
  }),
});

const FosterReferenceType = new GraphQLObjectType({
  name: 'FosterReferenceType',
  fields: (): GraphQLFieldConfigMap<ReferenceParent, unknown> => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    relationship: { type: GraphQLString },
    requestSentAt: {
      type: GraphQLString,
      resolve(parent) { return parent.requestSentAt?.toISOString(); },
    },
    responseReceivedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.responseReceivedAt?.toISOString(); },
    },
    status: { type: GraphQLString },
    rating: { type: GraphQLFloat },
    comments: { type: GraphQLString },
  }),
});

const OrientationItemType = new GraphQLObjectType({
  name: 'OrientationItemType',
  fields: (): GraphQLFieldConfigMap<OrientationItemParent, unknown> => ({
    _id: { type: GraphQLID },
    module: { type: GraphQLString },
    completedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.completedAt?.toISOString(); },
    },
    required: { type: GraphQLBoolean },
  }),
});

const FosterProfileType = new GraphQLObjectType({
  name: 'FosterProfileType',
  fields: (): GraphQLFieldConfigMap<FosterProfileParent, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    bio: { type: GraphQLString },
    photoUrl: { type: GraphQLString },
    maxAnimals: { type: GraphQLInt },
    acceptedAnimalTypes: { type: new GraphQLList(GraphQLString) },
    specialSkills: { type: new GraphQLList(GraphQLString) },
    housing: { type: HousingDetailType },
    experience: { type: new GraphQLList(PetExperienceType) },
    references: { type: new GraphQLList(FosterReferenceType) },
    orientation: { type: new GraphQLList(OrientationItemType) },
    agreementSignedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.agreementSignedAt?.toISOString(); },
    },
    agreementUrl: { type: GraphQLString },
    status: { type: GraphQLString },
    statusReason: { type: GraphQLString },
    backgroundCheckStatus: { type: GraphQLString },
    backgroundCheckDate: {
      type: GraphQLString,
      resolve(parent) { return parent.backgroundCheckDate?.toISOString(); },
    },
    totalAnimalsHelped: { type: GraphQLInt },
    currentAnimalCount: { type: GraphQLInt },
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

export const HousingDetailInput = new GraphQLInputObjectType({
  name: 'HousingDetailInput',
  fields: {
    type: { type: GraphQLString },
    ownershipStatus: { type: GraphQLString },
    hasYard: { type: GraphQLBoolean },
    yardFenced: { type: GraphQLBoolean },
    squareFootage: { type: GraphQLInt },
    landlordApproval: { type: GraphQLBoolean },
    landlordContact: { type: GraphQLString },
    documentUrls: { type: new GraphQLList(GraphQLString) },
  },
});

export const PetExperienceInput = new GraphQLInputObjectType({
  name: 'PetExperienceInput',
  fields: {
    animalType: { type: GraphQLString },
    years: { type: GraphQLInt },
    description: { type: GraphQLString },
    isFosterExperience: { type: GraphQLBoolean },
  },
});

export const FosterReferenceInput = new GraphQLInputObjectType({
  name: 'FosterReferenceInput',
  fields: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    relationship: { type: GraphQLString },
  },
});

export default FosterProfileType;
