import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap
} from 'graphql';
import { AnimalDocument } from '../../models/Animal';

const Animal = mongoose.model<AnimalDocument>('animal');

interface ApplicationParentValue {
  _id: string;
  animalId: string;
  userId: string;
  applicationData: string;
  status: string;
  submittedAt: Date;
}

const ApplicationType: GraphQLObjectType = new GraphQLObjectType({
  name: "ApplicationType",
  fields: (): GraphQLFieldConfigMap<ApplicationParentValue, unknown> => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    userId: { type: GraphQLString },
    applicationData: { type: GraphQLString },
    status: { type: GraphQLString },
    submittedAt: { type: GraphQLString },
    animal: {
      type: require("./animal_type").default,
      resolve(parentValue: ApplicationParentValue) {
        return Animal.findById(parentValue.animalId).then(animal => {
          return animal;
        });
      }
    }
  })
});

export default ApplicationType;
