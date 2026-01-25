import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
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
import EventType from './types/event_type';
import DonationType from './types/donation_type';
import FosterType from './types/foster_type';
import SavedSearchType from './types/saved_search_type';
import ApplicationTemplateType from './types/application_template_type';
import ActivityLogType from './types/activity_log_type';
import TerminalReaderType from './types/terminal_reader_type';
import MessageType from './types/message_type';
import VolunteerType from './types/volunteer_type';
import PaymentIntentType from './types/payment_intent_type';
import BehaviorNoteType from './types/behavior_note_type';
import AnnouncementType from './types/announcement_type';
import * as stripeTerminal from '../services/stripeTerminal';
import { EventDocument } from '../models/Event';
import { DonationDocument } from '../models/Donation';
import { FosterDocument } from '../models/Foster';
import { SavedSearchDocument } from '../models/SavedSearch';
import { ApplicationTemplateDocument } from '../models/ApplicationTemplate';
import { ActivityLogDocument } from '../models/ActivityLog';
import { TerminalReaderDocument } from '../models/TerminalReader';
import { MessageDocument } from '../models/Message';
import { VolunteerDocument } from '../models/Volunteer';
import { ReviewDocument } from '../models/Review';
import { NotificationDocument } from '../models/Notification';
import { BehaviorNoteDocument } from '../models/BehaviorNote';
import { AnnouncementDocument } from '../models/Announcement';

const User = mongoose.model<UserDocument>('user');
const Animal = mongoose.model<AnimalDocument>('animal');
const Application = mongoose.model<ApplicationDocument>('application');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const SuccessStoryModel = mongoose.model<SuccessStoryDocument>('successStory');
const ReviewModel = mongoose.model<ReviewDocument>('review');
const NotificationModel = mongoose.model<NotificationDocument>('notification');
const EventModel = mongoose.model<EventDocument>('event');
const DonationModel = mongoose.model<DonationDocument>('donation');
const FosterModel = mongoose.model<FosterDocument>('foster');
const SavedSearchModel = mongoose.model<SavedSearchDocument>('savedSearch');
const ApplicationTemplateModel = mongoose.model<ApplicationTemplateDocument>('applicationTemplate');
const ActivityLogModel = mongoose.model<ActivityLogDocument>('activityLog');
const TerminalReaderModel = mongoose.model<TerminalReaderDocument>('terminalReader');
const MessageModel = mongoose.model<MessageDocument>('message');
const VolunteerModel = mongoose.model<VolunteerDocument>('volunteer');
const BehaviorNoteModel = mongoose.model<BehaviorNoteDocument>('behaviorNote');
const AnnouncementModel = mongoose.model<AnnouncementDocument>('announcement');

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

const TemplateFieldInput = new GraphQLInputObjectType({
  name: 'TemplateFieldInput',
  fields: {
    label: { type: GraphQLString },
    fieldType: { type: GraphQLString },
    required: { type: GraphQLBoolean },
    options: { type: new GraphQLList(GraphQLString) }
  }
});

const AnimalInput = new GraphQLInputObjectType({
  name: 'AnimalInput',
  fields: {
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    breed: { type: GraphQLString },
    age: { type: GraphQLInt },
    sex: { type: GraphQLString },
    color: { type: GraphQLString },
    description: { type: GraphQLString },
    image: { type: GraphQLString },
    video: { type: GraphQLString }
  }
});

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
    createEvent: {
      type: EventType,
      args: {
        shelterId: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        date: { type: GraphQLString },
        endDate: { type: GraphQLString },
        location: { type: GraphQLString },
        eventType: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; title: string; description?: string; date: string; endDate?: string; location?: string; eventType?: string }) {
        const event = new EventModel({
          shelterId: args.shelterId,
          title: args.title,
          description: args.description || '',
          date: new Date(args.date),
          endDate: args.endDate ? new Date(args.endDate) : undefined,
          location: args.location || '',
          eventType: args.eventType || 'other'
        });
        await event.save();
        return event;
      }
    },
    deleteEvent: {
      type: EventType,
      args: { _id: { type: GraphQLID } },
      resolve(_, args: { _id: string }) {
        return EventModel.findByIdAndDelete(args._id);
      }
    },
    createDonation: {
      type: DonationType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLString },
        donorName: { type: GraphQLString },
        amount: { type: GraphQLFloat },
        message: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; userId?: string; donorName: string; amount: number; message?: string }) {
        // Validate required fields
        if (!args.shelterId || !args.donorName) {
          throw new Error('Shelter ID and donor name are required');
        }

        // Validate amount
        if (!args.amount || args.amount < 1) {
          throw new Error('Donation amount must be at least $1');
        }
        if (args.amount > 1000000) {
          throw new Error('Donation amount exceeds maximum allowed');
        }

        // Validate message length
        if (args.message && args.message.length > 500) {
          throw new Error('Message cannot exceed 500 characters');
        }

        const donation = new DonationModel({
          shelterId: args.shelterId,
          userId: args.userId || '',
          donorName: args.donorName.trim(),
          amount: args.amount,
          message: args.message?.trim() || ''
        });
        await donation.save();
        return donation;
      }
    },
    createFoster: {
      type: FosterType,
      args: {
        shelterId: { type: GraphQLID },
        animalId: { type: GraphQLID },
        userId: { type: GraphQLString },
        fosterName: { type: GraphQLString },
        fosterEmail: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
        notes: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; animalId: string; userId?: string; fosterName: string; fosterEmail?: string; startDate: string; endDate?: string; notes?: string }) {
        const foster = new FosterModel({
          shelterId: args.shelterId,
          animalId: args.animalId,
          userId: args.userId || '',
          fosterName: args.fosterName,
          fosterEmail: args.fosterEmail || '',
          startDate: new Date(args.startDate),
          endDate: args.endDate ? new Date(args.endDate) : undefined,
          status: 'active',
          notes: args.notes || ''
        });
        await foster.save();
        return foster;
      }
    },
    updateFosterStatus: {
      type: FosterType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
        endDate: { type: GraphQLString },
        notes: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; status?: string; endDate?: string; notes?: string }) {
        const foster = await FosterModel.findById(args._id);
        if (foster) {
          if (args.status) foster.status = args.status as typeof foster.status;
          if (args.endDate) foster.endDate = new Date(args.endDate);
          if (args.notes !== undefined) foster.notes = args.notes;
          await foster.save();
          return foster;
        }
        return null;
      }
    },
    createSavedSearch: {
      type: SavedSearchType,
      args: {
        userId: { type: GraphQLID },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        breed: { type: GraphQLString },
        sex: { type: GraphQLString },
        color: { type: GraphQLString },
        status: { type: GraphQLString },
        minAge: { type: GraphQLInt },
        maxAge: { type: GraphQLInt }
      },
      async resolve(_, args: { userId: string; name: string; type?: string; breed?: string; sex?: string; color?: string; status?: string; minAge?: number; maxAge?: number }) {
        const filters: Record<string, unknown> = {};
        if (args.type) filters.type = args.type;
        if (args.breed) filters.breed = args.breed;
        if (args.sex) filters.sex = args.sex;
        if (args.color) filters.color = args.color;
        if (args.status) filters.status = args.status;
        if (args.minAge !== undefined) filters.minAge = args.minAge;
        if (args.maxAge !== undefined) filters.maxAge = args.maxAge;
        const savedSearch = new SavedSearchModel({
          userId: args.userId,
          name: args.name,
          filters
        });
        await savedSearch.save();
        return savedSearch;
      }
    },
    deleteSavedSearch: {
      type: SavedSearchType,
      args: { _id: { type: GraphQLID } },
      resolve(_, args: { _id: string }) {
        return SavedSearchModel.findByIdAndDelete(args._id);
      }
    },
    logActivity: {
      type: ActivityLogType,
      args: {
        shelterId: { type: GraphQLID },
        action: { type: GraphQLString },
        entityType: { type: GraphQLString },
        entityId: { type: GraphQLString },
        description: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; action: string; entityType: string; entityId?: string; description: string }) {
        const log = new ActivityLogModel({
          shelterId: args.shelterId,
          action: args.action,
          entityType: args.entityType,
          entityId: args.entityId || '',
          description: args.description
        });
        await log.save();
        return log;
      }
    },
    verifyShelter: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        verified: { type: GraphQLBoolean }
      },
      async resolve(_, args: { shelterId: string; verified: boolean }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (shelter) {
          shelter.verified = args.verified;
          shelter.verifiedAt = args.verified ? new Date() : undefined;
          await shelter.save();
          return shelter;
        }
        return null;
      }
    },
    createApplicationTemplate: {
      type: ApplicationTemplateType,
      args: {
        shelterId: { type: GraphQLID },
        name: { type: GraphQLString },
        fields: { type: new GraphQLList(TemplateFieldInput) }
      },
      async resolve(_, args: { shelterId: string; name: string; fields: Array<{ label: string; fieldType: string; required?: boolean; options?: string[] }> }) {
        const template = new ApplicationTemplateModel({
          shelterId: args.shelterId,
          name: args.name,
          fields: (args.fields || []).map(f => ({
            label: f.label,
            fieldType: f.fieldType,
            required: f.required || false,
            options: f.options || []
          }))
        });
        await template.save();
        return template;
      }
    },
    deleteApplicationTemplate: {
      type: ApplicationTemplateType,
      args: { _id: { type: GraphQLID } },
      resolve(_, args: { _id: string }) {
        return ApplicationTemplateModel.findByIdAndDelete(args._id);
      }
    },
    bulkCreateAnimals: {
      type: new GraphQLList(AnimalType),
      args: {
        animals: { type: new GraphQLList(AnimalInput) },
        shelterId: { type: GraphQLID }
      },
      async resolve(_, args: { animals: Array<{ name: string; type: string; breed?: string; age: number; sex: string; color: string; description: string; image?: string; video?: string }>; shelterId?: string }) {
        const created = [];
        for (const animalData of args.animals) {
          const newAnimal = new Animal({
            name: animalData.name,
            type: animalData.type,
            breed: animalData.breed || '',
            age: animalData.age,
            sex: animalData.sex,
            color: animalData.color,
            description: animalData.description,
            image: animalData.image || '',
            video: animalData.video || '',
            status: 'available'
          });
          await newAnimal.save();
          created.push(newAnimal);
        }
        if (args.shelterId) {
          const shelter = await Shelter.findById(args.shelterId);
          if (shelter) {
            for (const animal of created) {
              shelter.animals.push(animal._id as unknown as typeof shelter.animals[0]);
            }
            await shelter.save();
          }
        }
        return created;
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
    },
    registerTerminalReader: {
      type: TerminalReaderType,
      args: {
        shelterId: { type: GraphQLID },
        registrationCode: { type: GraphQLString },
        label: { type: GraphQLString },
        location: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; registrationCode: string; label: string; location?: string }) {
        // Validate required fields
        if (!args.shelterId || !args.registrationCode || !args.label) {
          throw new Error('Shelter ID, registration code, and label are required');
        }

        // Validate label length
        if (args.label.length > 100) {
          throw new Error('Label cannot exceed 100 characters');
        }

        const reader = await stripeTerminal.registerReader({
          registrationCode: args.registrationCode,
          label: args.label,
          location: args.location
        });

        const terminalReader = new TerminalReaderModel({
          shelterId: args.shelterId,
          stripeReaderId: reader.id,
          label: args.label,
          deviceType: reader.device_type || 'simulated',
          serialNumber: reader.serial_number || '',
          location: args.location || '',
          status: 'online',
          registeredAt: new Date()
        });
        await terminalReader.save();
        return terminalReader;
      }
    },
    deleteTerminalReader: {
      type: TerminalReaderType,
      args: {
        _id: { type: GraphQLID }
      },
      async resolve(_, args: { _id: string }) {
        const reader = await TerminalReaderModel.findById(args._id);
        if (!reader) return null;

        await stripeTerminal.deleteReader(reader.stripeReaderId);
        await TerminalReaderModel.deleteOne({ _id: args._id });
        return reader;
      }
    },
    createTerminalPaymentIntent: {
      type: PaymentIntentType,
      args: {
        shelterId: { type: GraphQLID },
        readerId: { type: GraphQLString },
        amount: { type: GraphQLInt },
        currency: { type: GraphQLString },
        description: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; readerId: string; amount: number; currency?: string; description?: string }) {
        // Validate required fields
        if (!args.shelterId || !args.readerId) {
          throw new Error('Shelter ID and Reader ID are required');
        }

        // Validate amount
        if (!args.amount || args.amount < 50) {
          throw new Error('Amount must be at least 50 cents');
        }
        if (args.amount > 99999999) {
          throw new Error('Amount exceeds maximum allowed');
        }

        const paymentIntent = await stripeTerminal.createPaymentIntent({
          readerId: args.readerId,
          amount: args.amount,
          currency: args.currency,
          description: args.description
        });

        return {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          description: paymentIntent.description || '',
          clientSecret: paymentIntent.client_secret || ''
        };
      }
    },
    sendMessage: {
      type: MessageType,
      args: {
        senderId: { type: GraphQLString },
        recipientId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        content: { type: GraphQLString }
      },
      async resolve(_, args: { senderId: string; recipientId: string; shelterId: string; content: string }) {
        // Validate required fields
        if (!args.senderId || !args.recipientId || !args.shelterId) {
          throw new Error('Sender ID, recipient ID, and shelter ID are required');
        }

        // Validate content
        if (!args.content || !args.content.trim()) {
          throw new Error('Message content is required');
        }
        if (args.content.length > 5000) {
          throw new Error('Message cannot exceed 5000 characters');
        }

        // Prevent self-messaging
        if (args.senderId === args.recipientId) {
          throw new Error('Cannot send message to yourself');
        }

        const message = new MessageModel({
          senderId: args.senderId,
          recipientId: args.recipientId,
          shelterId: args.shelterId,
          content: args.content.trim(),
          read: false,
          createdAt: new Date()
        });
        await message.save();
        return message;
      }
    },
    markMessagesRead: {
      type: GraphQLBoolean,
      args: {
        shelterId: { type: GraphQLString },
        userId: { type: GraphQLString },
        readerId: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; userId: string; readerId: string }) {
        await MessageModel.updateMany(
          {
            shelterId: args.shelterId,
            senderId: args.userId,
            recipientId: args.readerId,
            read: false
          },
          { $set: { read: true } }
        );
        return true;
      }
    },
    addVolunteer: {
      type: VolunteerType,
      args: {
        shelterId: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        skills: { type: new GraphQLList(GraphQLString) },
        availability: { type: GraphQLString },
        notes: { type: GraphQLString }
      },
      async resolve(_, args: { shelterId: string; name: string; email?: string; phone?: string; skills?: string[]; availability?: string; notes?: string }) {
        // Validate required fields
        if (!args.shelterId || !args.name || !args.name.trim()) {
          throw new Error('Shelter ID and volunteer name are required');
        }

        // Validate email format if provided
        if (args.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
          throw new Error('Invalid email format');
        }

        // Validate skills limit
        if (args.skills && args.skills.length > 20) {
          throw new Error('Cannot specify more than 20 skills');
        }

        const volunteer = new VolunteerModel({
          shelterId: args.shelterId,
          name: args.name.trim(),
          email: args.email || '',
          phone: args.phone || '',
          skills: args.skills || [],
          availability: args.availability || '',
          status: 'pending',
          startDate: new Date(),
          totalHours: 0,
          notes: args.notes || ''
        });
        await volunteer.save();
        return volunteer;
      }
    },
    updateVolunteerStatus: {
      type: VolunteerType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString }
      },
      async resolve(_, args: { _id: string; status: string }) {
        const volunteer = await VolunteerModel.findById(args._id);
        if (volunteer) {
          volunteer.status = args.status as typeof volunteer.status;
          await volunteer.save();
          return volunteer;
        }
        return null;
      }
    },
    logVolunteerHours: {
      type: VolunteerType,
      args: {
        _id: { type: GraphQLID },
        hours: { type: GraphQLInt }
      },
      async resolve(_, args: { _id: string; hours: number }) {
        // Validate hours
        if (!args.hours || args.hours < 0) {
          throw new Error('Hours must be a positive number');
        }
        if (args.hours > 24) {
          throw new Error('Cannot log more than 24 hours at once');
        }

        const volunteer = await VolunteerModel.findById(args._id);
        if (!volunteer) {
          throw new Error('Volunteer not found');
        }
        volunteer.totalHours += args.hours;
        await volunteer.save();
        return volunteer;
      }
    },
    addBehaviorNote: {
      type: BehaviorNoteType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        noteType: { type: GraphQLString },
        severity: { type: GraphQLString },
        content: { type: GraphQLString },
        author: { type: GraphQLString }
      },
      async resolve(_, args: {
        animalId: string;
        shelterId: string;
        noteType: string;
        severity: string;
        content: string;
        author?: string;
      }) {
        // Validate required fields
        if (!args.animalId || !args.shelterId) {
          throw new Error('Animal ID and Shelter ID are required');
        }
        if (!args.content || args.content.length > 2000) {
          throw new Error('Content is required and must be less than 2000 characters');
        }

        const note = new BehaviorNoteModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          noteType: args.noteType || 'general',
          severity: args.severity || 'info',
          content: args.content,
          author: args.author || '',
          resolved: false,
          createdAt: new Date()
        });
        await note.save();
        return note;
      }
    },
    resolveBehaviorNote: {
      type: BehaviorNoteType,
      args: {
        _id: { type: GraphQLID }
      },
      async resolve(_, args: { _id: string }) {
        const note = await BehaviorNoteModel.findById(args._id);
        if (!note) {
          throw new Error('Behavior note not found');
        }
        note.resolved = true;
        note.resolvedAt = new Date();
        await note.save();
        return note;
      }
    },
    createAnnouncement: {
      type: AnnouncementType,
      args: {
        shelterId: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        category: { type: GraphQLString },
        author: { type: GraphQLString }
      },
      async resolve(_, args: {
        shelterId: string;
        title: string;
        content: string;
        category: string;
        author?: string;
      }) {
        if (!args.shelterId) {
          throw new Error('Shelter ID is required');
        }
        if (!args.title || args.title.length > 200) {
          throw new Error('Title is required and must be less than 200 characters');
        }
        if (!args.content || args.content.length > 5000) {
          throw new Error('Content is required and must be less than 5000 characters');
        }

        const announcement = new AnnouncementModel({
          shelterId: args.shelterId,
          title: args.title,
          content: args.content,
          category: args.category || 'general',
          author: args.author || '',
          pinned: false,
          active: true,
          createdAt: new Date()
        });
        await announcement.save();
        return announcement;
      }
    },
    toggleAnnouncementPin: {
      type: AnnouncementType,
      args: {
        _id: { type: GraphQLID }
      },
      async resolve(_, args: { _id: string }) {
        const announcement = await AnnouncementModel.findById(args._id);
        if (!announcement) {
          throw new Error('Announcement not found');
        }
        announcement.pinned = !announcement.pinned;
        await announcement.save();
        return announcement;
      }
    },
    deleteAnnouncement: {
      type: AnnouncementType,
      args: {
        _id: { type: GraphQLID }
      },
      async resolve(_, args: { _id: string }) {
        const announcement = await AnnouncementModel.findByIdAndDelete(args._id);
        return announcement;
      }
    }
  })
});

export default mutation;
