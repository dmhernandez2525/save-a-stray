import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface CompatibilityAssessmentParent {
  _id?: string;
  criterion: string;
  score: number;
  notes: string;
}

interface FosterPlacementParent {
  _id?: string;
  shelterId: string;
  fosterProfileId: string;
  userId: string;
  animalId: string;
  status: string;
  isEmergency: boolean;
  priority: number;
  requestedBy: string;
  requestedAt: Date;
  acceptedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  expectedDuration: number;
  matchScore: number;
  matchFactors: Map<string, number>;
  compatibilityAssessment: CompatibilityAssessmentParent[];
  notes: string;
  returnReason: string;
  createdAt: Date;
}

const CompatibilityAssessmentType = new GraphQLObjectType({
  name: 'CompatibilityAssessmentType',
  fields: (): GraphQLFieldConfigMap<CompatibilityAssessmentParent, unknown> => ({
    _id: { type: GraphQLID },
    criterion: { type: GraphQLString },
    score: { type: GraphQLInt },
    notes: { type: GraphQLString },
  }),
});

const MatchFactorEntryType = new GraphQLObjectType({
  name: 'FosterMatchFactorEntryType',
  fields: {
    key: { type: GraphQLString },
    value: { type: GraphQLFloat },
  },
});

const FosterPlacementType = new GraphQLObjectType({
  name: 'FosterPlacementType',
  fields: (): GraphQLFieldConfigMap<FosterPlacementParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    fosterProfileId: { type: GraphQLString },
    userId: { type: GraphQLString },
    animalId: { type: GraphQLString },
    status: { type: GraphQLString },
    isEmergency: { type: GraphQLBoolean },
    priority: { type: GraphQLInt },
    requestedBy: { type: GraphQLString },
    requestedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.requestedAt?.toISOString(); },
    },
    acceptedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.acceptedAt?.toISOString(); },
    },
    startDate: {
      type: GraphQLString,
      resolve(parent) { return parent.startDate?.toISOString(); },
    },
    endDate: {
      type: GraphQLString,
      resolve(parent) { return parent.endDate?.toISOString(); },
    },
    expectedDuration: { type: GraphQLInt },
    matchScore: { type: GraphQLFloat },
    matchFactors: {
      type: new GraphQLList(MatchFactorEntryType),
      resolve(parent) {
        if (!parent.matchFactors) return [];
        const entries: { key: string; value: number }[] = [];
        parent.matchFactors.forEach((value: number, key: string) => {
          entries.push({ key, value });
        });
        return entries;
      },
    },
    compatibilityAssessment: { type: new GraphQLList(CompatibilityAssessmentType) },
    notes: { type: GraphQLString },
    returnReason: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default FosterPlacementType;
