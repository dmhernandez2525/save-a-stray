import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLFieldConfigMap
} from 'graphql';
import { AnimalDocument } from '../../models/Animal';
import MedicalRecordType from './medical_record_type';

const Animal = mongoose.model<AnimalDocument>('animal');

interface AnimalParentValue {
  _id: string;
  name: string;
  type: string;
  age: number;
  breed?: string;
  sex: string;
  color: string;
  image: string;
  video: string;
  description: string;
  status: string;
}

const AnimalType: GraphQLObjectType = new GraphQLObjectType({
  name: "AnimalType",
  fields: (): GraphQLFieldConfigMap<AnimalParentValue, unknown> => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    age: { type: GraphQLInt },
    breed: { type: GraphQLString },
    sex: { type: GraphQLString },
    color: { type: GraphQLString },
    image: { type: GraphQLString },
    images: { type: new GraphQLList(GraphQLString) },
    video: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    medicalRecords: { type: new GraphQLList(MedicalRecordType) },
    applications: {
      type: new GraphQLList(require("./application_type").default),
      resolve(parentValue: AnimalParentValue) {
        return Animal.findById(parentValue._id)
          .populate("applications")
          .then(animal => {
            return animal?.applications;
          });
      }
    }
  })
});

export default AnimalType;
