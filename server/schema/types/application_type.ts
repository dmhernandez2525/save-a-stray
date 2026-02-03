import { Types } from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap
} from 'graphql';
import { GraphQLContext } from '../../graphql/context';

interface ApplicationParentValue {
  _id: string;
  animalId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  applicationData: string;
  status: string;
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
