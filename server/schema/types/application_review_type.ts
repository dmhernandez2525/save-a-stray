import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface CriterionScoreParent {
  criterion: string;
  score: number;
  comment: string;
}

interface ApplicationReviewParent {
  _id?: string;
  applicationId: string;
  reviewerId: string;
  scores: CriterionScoreParent[];
  overallScore: number;
  recommendation: string;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CriterionScoreType = new GraphQLObjectType({
  name: 'CriterionScoreType',
  fields: (): GraphQLFieldConfigMap<CriterionScoreParent, unknown> => ({
    criterion: { type: GraphQLString },
    score: { type: GraphQLFloat },
    comment: { type: GraphQLString },
  }),
});

const ApplicationReviewType = new GraphQLObjectType({
  name: 'ApplicationReviewType',
  fields: (): GraphQLFieldConfigMap<ApplicationReviewParent, unknown> => ({
    _id: { type: GraphQLID },
    applicationId: { type: GraphQLString },
    reviewerId: { type: GraphQLString },
    scores: { type: new GraphQLList(CriterionScoreType) },
    overallScore: { type: GraphQLFloat },
    recommendation: { type: GraphQLString },
    notes: { type: GraphQLString },
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

export default ApplicationReviewType;
