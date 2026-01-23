import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLFieldConfigMap
} from 'graphql';
import UserType from './user_type';
import AnimalType from './animal_type';
import ApplicationType from './application_type';
import ShelterType from './shelter_type';
import SuccessStoryType from './success_story_type';
import { ApplicationDocument } from '../../models/Application';
import { AnimalDocument } from '../../models/Animal';
import { UserDocument } from '../../models/User';
import { ShelterDocument } from '../../models/Shelter';
import { SuccessStoryDocument } from '../../models/SuccessStory';

const Application = mongoose.model<ApplicationDocument>('application');
const Animal = mongoose.model<AnimalDocument>('animal');
const User = mongoose.model<UserDocument>('user');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const SuccessStoryModel = mongoose.model<SuccessStoryDocument>('successStory');

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
    users: {
      type: new GraphQLList(UserType),
      resolve() {
        return User.find({});
      }
    },
    user: {
      type: UserType,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { _id: string }) {
        return User.findById(args._id);
      }
    },
    animals: {
      type: new GraphQLList(AnimalType),
      resolve() {
        return Animal.find({});
      }
    },
    findAnimals: {
      type: new GraphQLList(AnimalType),
      args: {
        type: { type: GraphQLString },
        breed: { type: GraphQLString },
        sex: { type: GraphQLString },
        color: { type: GraphQLString },
        name: { type: GraphQLString },
        status: { type: GraphQLString },
        minAge: { type: GraphQLInt },
        maxAge: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve(_, args: { type?: string; breed?: string; sex?: string; color?: string; name?: string; status?: string; minAge?: number; maxAge?: number; limit?: number; offset?: number }) {
        const filter: Record<string, unknown> = {};
        if (args.type) filter.type = args.type;
        if (args.breed) filter.breed = { $regex: args.breed, $options: 'i' };
        if (args.sex) filter.sex = args.sex;
        if (args.status) filter.status = args.status;
        if (args.color) filter.color = { $regex: args.color, $options: 'i' };
        if (args.name) filter.name = { $regex: args.name, $options: 'i' };
        if (args.minAge !== undefined || args.maxAge !== undefined) {
          filter.age = {};
          if (args.minAge !== undefined) (filter.age as Record<string, number>).$gte = args.minAge;
          if (args.maxAge !== undefined) (filter.age as Record<string, number>).$lte = args.maxAge;
        }
        let query = Animal.find(filter);
        if (args.offset !== undefined) query = query.skip(args.offset);
        if (args.limit !== undefined) query = query.limit(args.limit);
        return query;
      }
    },
    applications: {
      type: new GraphQLList(ApplicationType),
      resolve() {
        return Application.find({});
      }
    },
    animal: {
      type: AnimalType,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { _id: string }) {
        return Animal.findById(args._id);
      }
    },
    userFavorites: {
      type: new GraphQLList(AnimalType),
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { userId: string }) {
        const user = await User.findById(args.userId);
        if (!user || !user.favorites || user.favorites.length === 0) return [];
        return Animal.find({ _id: { $in: user.favorites } });
      }
    },
    userApplications: {
      type: new GraphQLList(ApplicationType),
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { userId: string }) {
        return Application.find({ userId: args.userId });
      }
    },
    shelterApplications: {
      type: new GraphQLList(ApplicationType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.animals || shelter.animals.length === 0) return [];
        const animalIds = shelter.animals.map((id) => id.toString());
        return Application.find({ animalId: { $in: animalIds } });
      }
    },
    shelters: {
      type: new GraphQLList(ShelterType),
      resolve() {
        return Shelter.find({});
      }
    },
    shelter: {
      type: ShelterType,
      args: { _id: { type: GraphQLID } },
      resolve(_, args: { _id: string }) {
        return Shelter.findById(args._id);
      }
    },
    successStories: {
      type: new GraphQLList(SuccessStoryType),
      resolve() {
        return SuccessStoryModel.find({}).sort({ createdAt: -1 });
      }
    }
  })
});

export default RootQueryType;
