import { Types } from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLFieldConfigMap
} from 'graphql';
import MedicalRecordType from './medical_record_type';
import { GraphQLContext } from '../../graphql/context';
import { filterLoaderResults } from '../../graphql/loaders';


interface AnimalParentValue {
  _id: string;
  name: string;
  type: string;
  age: number;
  breed?: string;
  sex: string;
  color: string;
  image: string;
  images?: string[];
  video: string;
  description: string;
  status: string;
  size?: string;
  temperament?: string;
  energyLevel?: string;
  houseTrained?: boolean;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  personalityTraits?: string[];
  specialNeeds?: string;
  microchipId?: string;
  intakeDate?: Date;
  intakeSource?: string;
  adoptionFee?: number;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  shelterId?: string;
  applications?: Array<string | Types.ObjectId>;
}

const AnimalType: GraphQLObjectType = new GraphQLObjectType({
  name: "AnimalType",
  fields: (): GraphQLFieldConfigMap<AnimalParentValue, GraphQLContext> => ({
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
    size: { type: GraphQLString },
    temperament: { type: GraphQLString },
    energyLevel: { type: GraphQLString },
    houseTrained: { type: GraphQLBoolean },
    goodWithKids: { type: GraphQLBoolean },
    goodWithDogs: { type: GraphQLBoolean },
    goodWithCats: { type: GraphQLBoolean },
    personalityTraits: { type: new GraphQLList(GraphQLString) },
    specialNeeds: { type: GraphQLString },
    microchipId: { type: GraphQLString },
    intakeDate: {
      type: GraphQLString,
      resolve(parent: AnimalParentValue) {
        return parent.intakeDate ? new Date(parent.intakeDate).toISOString() : null;
      },
    },
    intakeSource: { type: GraphQLString },
    adoptionFee: { type: GraphQLFloat },
    slug: { type: GraphQLString },
    metaTitle: { type: GraphQLString },
    metaDescription: { type: GraphQLString },
    shelterId: { type: GraphQLID },
    lengthOfStay: {
      type: GraphQLInt,
      resolve(parent: AnimalParentValue) {
        if (!parent.intakeDate) return null;
        const intake = new Date(parent.intakeDate);
        const now = new Date();
        return Math.floor((now.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24));
      },
    },
    medicalRecords: { type: new GraphQLList(MedicalRecordType) },
    applications: {
      type: new GraphQLList(require("./application_type").default),
      async resolve(parentValue: AnimalParentValue, _args, context: GraphQLContext) {
        const applicationIds = parentValue.applications?.map((id) => id.toString()) ?? [];
        if (applicationIds.length > 0) {
          const results = await context.loaders.applicationById.loadMany(applicationIds);
          return filterLoaderResults(results);
        }
        const animal = await context.loaders.animalById.load(parentValue._id);
        const resolvedIds = animal?.applications?.map((id) => id.toString()) ?? [];
        if (resolvedIds.length === 0) return [];
        const results = await context.loaders.applicationById.loadMany(resolvedIds);
        return filterLoaderResults(results);
      }
    }
  })
});

export default AnimalType;
