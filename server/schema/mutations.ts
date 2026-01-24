import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLFieldConfigMap
} from 'graphql';
import mongoose from 'mongoose';
import UserType from './types/user_type';
import AnimalType from './types/animal_type';
import ShelterType from './types/shelter_type';
import ApplicationType from './types/application_type';
import VaccinationType from './types/vaccination_type';
import AuthService from '../services/auth';
import { UserDocument } from '../models/User';
import { AnimalDocument } from '../models/Animal';
import { ApplicationDocument } from '../models/Application';
import { ShelterDocument } from '../models/Shelter';
import { VaccinationDocument } from '../models/Vaccination';

const User = mongoose.model<UserDocument>('user');
const Animal = mongoose.model<AnimalDocument>('animal');
const Application = mongoose.model<ApplicationDocument>('application');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const Vaccination = mongoose.model<VaccinationDocument>('vaccination');

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
    addVaccination: {
      type: VaccinationType,
      args: {
        animalId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        vaccineName: { type: GraphQLString },
        batchNumber: { type: GraphQLString },
        administeredBy: { type: GraphQLString },
        administeredDate: { type: GraphQLString },
        expirationDate: { type: GraphQLString },
        notes: { type: GraphQLString }
      },
      async resolve(_, args: { animalId: string; shelterId: string; vaccineName: string; batchNumber: string; administeredBy: string; administeredDate: string; expirationDate: string; notes: string }) {
        const vaccination = new Vaccination({
          animalId: args.animalId,
          shelterId: args.shelterId,
          vaccineName: args.vaccineName,
          batchNumber: args.batchNumber || '',
          administeredBy: args.administeredBy || '',
          administeredDate: args.administeredDate ? new Date(args.administeredDate) : new Date(),
          expirationDate: args.expirationDate ? new Date(args.expirationDate) : null,
          status: 'current',
          notes: args.notes || ''
        });
        await vaccination.save();
        return vaccination;
      }
    },
    updateVaccinationStatus: {
      type: VaccinationType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; status: string }) {
        const vaccination = await Vaccination.findById(args._id);
        if (vaccination) {
          vaccination.status = args.status as typeof vaccination.status;
          await vaccination.save();
          return vaccination;
        }
        return null;
      }
    }
  })
});

export default mutation;
