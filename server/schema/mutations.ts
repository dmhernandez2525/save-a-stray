import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLFieldConfigMap
} from 'graphql';
import mongoose from 'mongoose';
import UserType from './types/user_type';
import AnimalType from './types/animal_type';
import ShelterType from './types/shelter_type';
import ApplicationType from './types/application_type';
import SuccessStoryType from './types/success_story_type';
import AuthService from '../services/auth';
import { UserDocument } from '../models/User';
import { AnimalDocument } from '../models/Animal';
import { ApplicationDocument } from '../models/Application';
import { ShelterDocument } from '../models/Shelter';
import { SuccessStoryDocument } from '../models/SuccessStory';
import ReviewType from './types/review_type';
import NotificationType from './types/notification_type';
import { ReviewDocument } from '../models/Review';
import { NotificationDocument } from '../models/Notification';

const User = mongoose.model<UserDocument>('user');
const Animal = mongoose.model<AnimalDocument>('animal');
const Application = mongoose.model<ApplicationDocument>('application');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const SuccessStoryModel = mongoose.model<SuccessStoryDocument>('successStory');
const ReviewModel = mongoose.model<ReviewDocument>('review');
const NotificationModel = mongoose.model<NotificationDocument>('notification');

interface RegisterArgs {
  name: string;
  email: string;
  password: string;
  userRole: string;
  shelterId?: string;
  shelterName?: string;
  shelterLocation?: string;
  shelterPaymentEmail?: string;
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
  images?: string[];
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
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  description?: string;
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
        shelterId: { type: GraphQLString },
        shelterName: { type: GraphQLString },
        shelterLocation: { type: GraphQLString },
        shelterPaymentEmail: { type: GraphQLString }
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
        images: { type: new GraphQLList(GraphQLString) },
        video: { type: GraphQLString },
        status: { type: GraphQLString },
        applications: { type: GraphQLID }
      },
      async resolve(_, args: AnimalArgs) {
        const { name, type, breed, age, sex, color, description, image, images, video, status } = args;
        const newAnimal = new Animal({ name, type, breed: breed || '', age, sex, color, description, image, images: images || [], video, status: status || 'available' });
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
        images: { type: new GraphQLList(GraphQLString) },
        video: { type: GraphQLString },
        status: { type: GraphQLString },
        applications: { type: GraphQLID }
      },
      async resolve(_, args: AnimalArgs & { _id: string }) {
        const { _id, name, type, breed, age, sex, color, description, image, images, video, status } = args;
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
          if (images !== undefined) animal.images = images;
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
    markNotificationRead: {
      type: NotificationType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }) {
        const notification = await NotificationModel.findById(args._id);
        if (notification) {
          notification.read = true;
          await notification.save();
          return notification;
        }
        return null;
      }
    },
    markAllNotificationsRead: {
      type: GraphQLString,
      args: { userId: { type: GraphQLString } },
      async resolve(_, args: { userId: string }) {
        await NotificationModel.updateMany({ userId: args.userId, read: false }, { read: true });
        return 'success';
      }
    },
    createReview: {
      type: ReviewType,
      args: {
        userId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        rating: { type: GraphQLInt },
        comment: { type: GraphQLString }
      },
      async resolve(_, args: { userId: string; shelterId: string; rating: number; comment?: string }) {
        const review = new ReviewModel({
          userId: args.userId,
          shelterId: args.shelterId,
          rating: args.rating,
          comment: args.comment || ''
        });
        await review.save();
        return review;
      }
    },
    addMedicalRecord: {
      type: AnimalType,
      args: {
        animalId: { type: GraphQLID },
        date: { type: GraphQLString },
        recordType: { type: GraphQLString },
        description: { type: GraphQLString },
        veterinarian: { type: GraphQLString }
      },
      async resolve(_, args: { animalId: string; date: string; recordType: string; description: string; veterinarian?: string }) {
        const animal = await Animal.findById(args.animalId);
        if (animal) {
          if (!animal.medicalRecords) animal.medicalRecords = [];
          animal.medicalRecords.push({
            date: args.date,
            recordType: args.recordType,
            description: args.description,
            veterinarian: args.veterinarian || ''
          });
          await animal.save();
          return animal;
        }
        return null;
      }
    },
    updateUser: {
      type: UserType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; name?: string; email?: string }) {
        const user = await User.findById(args._id);
        if (user) {
          if (args.name) user.name = args.name;
          if (args.email) user.email = args.email;
          await user.save();
          return user;
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
        paymentEmail: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        website: { type: GraphQLString },
        hours: { type: GraphQLString },
        description: { type: GraphQLString }
      },
      async resolve(_, args: ShelterArgs) {
        const { name, location, paymentEmail, phone, email, website, hours, description } = args;
        const newShelter = new Shelter({ name, location, paymentEmail, phone, email, website, hours, description });
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
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        website: { type: GraphQLString },
        hours: { type: GraphQLString },
        description: { type: GraphQLString },
        animals: { type: GraphQLString }
      },
      async resolve(_, args: ShelterArgs & { _id: string }) {
        const { _id, name, location, users, paymentEmail, phone, email, website, hours, description, animals } = args;
        const shelter = await Shelter.findById(_id);
        if (shelter) {
          shelter.name = name;
          shelter.location = location;
          if (users) shelter.users = users as unknown as (typeof shelter.users);
          shelter.paymentEmail = paymentEmail;
          if (phone !== undefined) shelter.phone = phone;
          if (email !== undefined) shelter.email = email;
          if (website !== undefined) shelter.website = website;
          if (hours !== undefined) shelter.hours = hours;
          if (description !== undefined) shelter.description = description;
          if (animals) shelter.animals = animals as unknown as (typeof shelter.animals);
          await shelter.save();
          return shelter;
        }
        return null;
      }
    },
    addShelterStaff: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        email: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; email: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) return null;
        const user = await User.findOne({ email: args.email });
        if (!user) throw new Error('User not found with that email');
        const alreadyStaff = shelter.users.some(
          (id) => id.toString() === user._id.toString()
        );
        if (alreadyStaff) throw new Error('User is already staff');
        shelter.users.push(user._id as unknown as typeof shelter.users[0]);
        user.userRole = 'shelter';
        user.shelterId = shelter._id as unknown as typeof user.shelterId;
        await user.save();
        await shelter.save();
        return shelter;
      }
    },
    removeShelterStaff: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLID }
      },
      async resolve(_, args: { shelterId: string; userId: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) return null;
        shelter.users = shelter.users.filter(
          (id) => id.toString() !== args.userId
        ) as typeof shelter.users;
        const user = await User.findById(args.userId);
        if (user) {
          user.userRole = 'endUser';
          user.shelterId = undefined as unknown as typeof user.shelterId;
          await user.save();
        }
        await shelter.save();
        return shelter;
      }
    },
    createSuccessStory: {
      type: SuccessStoryType,
      args: {
        userId: { type: GraphQLString },
        animalName: { type: GraphQLString },
        animalType: { type: GraphQLString },
        title: { type: GraphQLString },
        story: { type: GraphQLString },
        image: { type: GraphQLString }
      },
      async resolve(_, args: { userId: string; animalName: string; animalType: string; title: string; story: string; image?: string }) {
        const { userId, animalName, animalType, title, story, image } = args;
        const successStory = new SuccessStoryModel({
          userId,
          animalName,
          animalType,
          title,
          story,
          image: image || '',
          createdAt: new Date()
        });
        await successStory.save();
        return successStory;
      }
    }
  })
});

export default mutation;
