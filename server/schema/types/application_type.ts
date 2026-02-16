import { Types } from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLFieldConfigMap
} from 'graphql';
import { GraphQLContext } from '../../graphql/context';

interface ApplicationParentValue {
  _id: string;
  animalId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  applicationData: string;
  status: string;
  isDraft?: boolean;
  currentStep?: number;
  totalSteps?: number;
  templateId?: string;
  applicationFee?: number;
  applicationFeeStatus?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt: Date;
}

const ApplicationType: GraphQLObjectType = new GraphQLObjectType({
  name: "ApplicationType",
  fields: (): GraphQLFieldConfigMap<ApplicationParentValue, GraphQLContext> => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    userId: { type: GraphQLString },
    applicationData: { type: GraphQLString },
    status: { type: GraphQLString },
    isDraft: { type: GraphQLBoolean },
    currentStep: { type: GraphQLInt },
    totalSteps: { type: GraphQLInt },
    templateId: { type: GraphQLString },
    applicationFee: { type: GraphQLFloat },
    applicationFeeStatus: { type: GraphQLString },
    reviewNotes: { type: GraphQLString },
    reviewedBy: { type: GraphQLString },
    reviewedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.reviewedAt?.toISOString(); },
    },
    submittedAt: { type: GraphQLString },
    animal: {
      type: require("./animal_type").default,
      resolve(parentValue: ApplicationParentValue, _args, context: GraphQLContext) {
        return context.loaders.animalById.load(parentValue.animalId.toString());
      }
    }
  })
});

export default ApplicationType;
