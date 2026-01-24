import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfigMap
} from 'graphql';
import mongoose from 'mongoose';
import UserType from './types/user_type';
import AnimalType from './types/animal_type';
import ShelterType from './types/shelter_type';
import ApplicationType from './types/application_type';
import AnnouncementType from './types/announcement_type';
import AuthService from '../services/auth';
import { UserDocument } from '../models/User';
import { AnimalDocument } from '../models/Animal';
import { ApplicationDocument } from '../models/Application';
import { ShelterDocument } from '../models/Shelter';
import { AnnouncementDocument } from '../models/Announcement';

const User = mongoose.model<UserDocument>('user');
const Animal = mongoose.model<AnimalDocument>('animal');
const Application = mongoose.model<ApplicationDocument>('application');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const Announcement = mongoose.model<AnnouncementDocument>('announcement');

interface RegisterArgs {
  name: string;
  email: string;
  password: string;
  userRole: string;
  shelterId?: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface LogoutArgs {
  _id: string;
}

interface VerifyUserArgs {
  token: string;
}

interface AnimalArgs {
  _id?: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  sex: string;
  color: string;
  description: string;
  image: string;
  video: string;
  status?: string;
  applications?: string;
}

interface ApplicationArgs {
  _id?: string;
  animalId: string;
  userId: string;
  applicationData: string;
}

interface ShelterArgs {
  _id?: string;
  name: string;
  location: string;
  users?: string;
  paymentEmail: string;
  animals?: string;
}

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
    register: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        userRole: { type: GraphQLString },
        shelterId: { type: GraphQLString }
      },
      resolve(_, args: RegisterArgs) {
        return AuthService.register(args);
      }
    },
    login: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve(_, args: LoginArgs) {
        return AuthService.login(args);
      }
    },
    logout: {
      type: UserType,
      args: {
        _id: { type: GraphQLID }
      },
      resolve(_, args: LogoutArgs) {
        return AuthService.logout(args);
      }
    },
    verifyUser: {
      type: UserType,
      args: {
        token: { type: GraphQLString }
      },
      resolve(_, args: VerifyUserArgs) {
        return AuthService.verifyUser(args);
      }
    },
    userId: {
      type: UserType,
      args: {
        token: { type: GraphQLString }
      },
      resolve(_, args: VerifyUserArgs) {
        return AuthService.userId(args);
      }
    },
    newAnimal: {
      type: AnimalType,
      args: {
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        breed: { type: GraphQLString },
        age: { type: GraphQLInt },
        sex: { type: GraphQLString },
        color: { type: GraphQLString },
        description: { type: GraphQLString },
        image: { type: GraphQLString },
        video: { type: GraphQLString },
        status: { type: GraphQLString },
        applications: { type: GraphQLID }
      },
      async resolve(_, args: AnimalArgs) {
        const { name, type, breed, age, sex, color, description, image, video, status } = args;
        const newAnimal = new Animal({ name, type, breed: breed || '', age, sex, color, description, image, video, status: status || 'available' });
        await newAnimal.save();
        return newAnimal;
      }
    },
    deleteAnimal: {
      type: AnimalType,
      args: {
        _id: { type: GraphQLID }
      },
      resolve(_, args: { _id: string }) {
        return Animal.deleteOne({ _id: args._id });
      }
    },
    updateAnimal: {
      type: AnimalType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        breed: { type: GraphQLString },
        age: { type: GraphQLInt },
        sex: { type: GraphQLString },
        color: { type: GraphQLString },
        description: { type: GraphQLString },
        image: { type: GraphQLString },
        video: { type: GraphQLString },
        status: { type: GraphQLString },
        applications: { type: GraphQLID }
      },
      async resolve(_, args: AnimalArgs & { _id: string }) {
        const { _id, name, type, breed, age, sex, color, description, image, video, status } = args;
        const animal = await Animal.findById(_id);
        if (animal) {
          animal.name = name;
          animal.type = type;
          if (breed !== undefined) animal.breed = breed;
          animal.age = age;
          animal.sex = sex;
          animal.color = color;
          animal.description = description;
          animal.image = image;
          animal.video = video;
          if (status) animal.status = status as typeof animal.status;
          await animal.save();
          return animal;
        }
        return null;
      }
    },
    updateAnimalStatus: {
      type: AnimalType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; status: string }) {
        const animal = await Animal.findById(args._id);
        if (animal) {
          animal.status = args.status as typeof animal.status;
          await animal.save();
          return animal;
        }
        return null;
      }
    },
    newApplication: {
      type: ApplicationType,
      args: {
        animalId: { type: GraphQLString },
        userId: { type: GraphQLString },
        applicationData: { type: GraphQLString }
      },
      async resolve(_, args: ApplicationArgs) {
        const { animalId, userId, applicationData } = args;
        const newApp = new Application({ animalId, userId, applicationData, status: 'submitted', submittedAt: new Date() });
        const animal = await Animal.findById(animalId);
        if (animal) {
          animal.applications.push(newApp._id);
          await animal.save();
          await newApp.save();
          return newApp;
        }
        return null;
      }
    },
    deleteApplication: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID }
      },
      resolve(_, args: { _id: string }) {
        return Application.deleteOne({ _id: args._id });
      }
    },
    editApplication: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
        animalId: { type: GraphQLString },
        applicationData: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; applicationData: string }) {
        const { _id, applicationData } = args;
        const application = await Application.findById(_id);
        if (application) {
          application.applicationData = applicationData;
          await application.save();
          return application;
        }
        return null;
      }
    },
    updateApplicationStatus: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; status: string }) {
        const application = await Application.findById(args._id);
        if (application) {
          application.status = args.status as typeof application.status;
          await application.save();
          return application;
        }
        return null;
      }
    },
    addFavorite: {
      type: UserType,
      args: {
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID }
      },
      async resolve(_, args: { userId: string; animalId: string }) {
        const user = await User.findById(args.userId);
        if (user) {
          const alreadyFavorited = user.favorites.some(
            (id) => id.toString() === args.animalId
          );
          if (!alreadyFavorited) {
            user.favorites.push(args.animalId as unknown as typeof user.favorites[0]);
            await user.save();
          }
          return user;
        }
        return null;
      }
    },
    removeFavorite: {
      type: UserType,
      args: {
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID }
      },
      async resolve(_, args: { userId: string; animalId: string }) {
        const user = await User.findById(args.userId);
        if (user) {
          user.favorites = user.favorites.filter(
            (id) => id.toString() !== args.animalId
          ) as typeof user.favorites;
          await user.save();
          return user;
        }
        return null;
      }
    },
    newShelter: {
      type: ShelterType,
      args: {
        name: { type: GraphQLString },
        location: { type: GraphQLString },
        paymentEmail: { type: GraphQLString }
      },
      async resolve(_, args: ShelterArgs) {
        const { name, location, paymentEmail } = args;
        const newShelter = new Shelter({ name, location, paymentEmail });
        await newShelter.save();
        return newShelter;
      }
    },
    deleteShelter: {
      type: ShelterType,
      args: {
        _id: { type: GraphQLID }
      },
      resolve(_, args: { _id: string }) {
        return Shelter.deleteOne({ _id: args._id });
      }
    },
    editShelter: {
      type: ShelterType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        location: { type: GraphQLString },
        users: { type: GraphQLString },
        paymentEmail: { type: GraphQLString },
        animals: { type: GraphQLString }
      },
      async resolve(_, args: ShelterArgs & { _id: string }) {
        const { _id, name, location, users, paymentEmail, animals } = args;
        const shelter = await Shelter.findById(_id);
        if (shelter) {
          shelter.name = name;
          shelter.location = location;
          if (users) shelter.users = users as unknown as (typeof shelter.users);
          shelter.paymentEmail = paymentEmail;
          if (animals) shelter.animals = animals as unknown as (typeof shelter.animals);
          await shelter.save();
          return shelter;
        }
        return null;
      }
    },
    createAnnouncement: {
      type: AnnouncementType,
      args: {
        shelterId: { type: GraphQLString },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        category: { type: GraphQLString },
        author: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; title: string; content: string; category: string; author: string }) {
        const announcement = new Announcement({
          shelterId: args.shelterId,
          title: args.title,
          content: args.content,
          category: args.category || 'general',
          author: args.author || '',
          pinned: false,
          active: true
        });
        await announcement.save();
        return announcement;
      }
    },
    toggleAnnouncementPin: {
      type: AnnouncementType,
      args: {
        _id: { type: GraphQLID },
        pinned: { type: GraphQLBoolean }
      },
      async resolve(_, args: { _id: string; pinned: boolean }) {
        const announcement = await Announcement.findById(args._id);
        if (announcement) {
          announcement.pinned = args.pinned;
          await announcement.save();
          return announcement;
        }
        return null;
      }
    },
    deleteAnnouncement: {
      type: AnnouncementType,
      args: {
        _id: { type: GraphQLID }
      },
      async resolve(_, args: { _id: string }) {
        const announcement = await Announcement.findById(args._id);
        if (announcement) {
          announcement.active = false;
          await announcement.save();
          return announcement;
        }
        return null;
      }
    }
  })
});

export default mutation;
