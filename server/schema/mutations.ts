import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';
import mongoose from 'mongoose';
import UserType from './types/user_type';
import AnimalType from './types/animal_type';
import ShelterType from './types/shelter_type';
import ApplicationType from './types/application_type';
import SuccessStoryType from './types/success_story_type';
import { register, login, refreshToken as refreshAccessToken, logout } from '../services/auth-primary';
import { verifyUser, userId } from '../services/auth-legacy';
import {
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  setupTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  getActiveSessionsForUser,
  revokeSessionById,
  completeGoogleOAuth,
  completeFacebookOAuth,
  resendEmailVerification,
} from '../services/auth-account';
import AuthSessionType from './types/auth_session_type';
import TwoFactorSetupType from './types/two_factor_setup_type';
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
import MicrochipType from './types/microchip_type';
import WeightRecordType from './types/weight_record_type';
import VaccinationType from './types/vaccination_type';
import AdoptionFeeType from './types/adoption_fee_type';
import SpayNeuterType from './types/spay_neuter_type';
import IntakeLogType from './types/intake_log_type';
import OutcomeLogType from './types/outcome_log_type';
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
import { MicrochipDocument } from '../models/Microchip';
import { WeightRecordDocument } from '../models/WeightRecord';
import { VaccinationDocument } from '../models/Vaccination';
import { AdoptionFeeDocument } from '../models/AdoptionFee';
import { SpayNeuterDocument } from '../models/SpayNeuter';
import { IntakeLogDocument } from '../models/IntakeLog';
import { OutcomeLogDocument } from '../models/OutcomeLog';
import { pubsub, SUBSCRIPTION_EVENTS } from '../graphql/pubsub';
import { GraphQLContext } from '../graphql/context';
import { DateScalar, EmailScalar, URLScalar } from './scalars';
import {
  requireAuth,
  requireShelterStaff,
  requireAdmin,
  requireSelf,
  requireApplicationAccess,
} from '../graphql/authorization';

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
const MicrochipModel = mongoose.model<MicrochipDocument>('microchip');
const WeightRecordModel = mongoose.model<WeightRecordDocument>('weightRecord');
const VaccinationModel = mongoose.model<VaccinationDocument>('vaccination');
const AdoptionFeeModel = mongoose.model<AdoptionFeeDocument>('adoptionFee');
const SpayNeuterModel = mongoose.model<SpayNeuterDocument>('spayNeuter');
const IntakeLogModel = mongoose.model<IntakeLogDocument>('intakeLog');
const OutcomeLogModel = mongoose.model<OutcomeLogDocument>('outcomeLog');

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
  totpCode?: string;
  backupCode?: string;
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
  intakeDate?: string;
  intakeSource?: string;
  adoptionFee?: number;
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
    options: { type: new GraphQLList(GraphQLString) },
  },
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
    images: { type: new GraphQLList(GraphQLString) },
    video: { type: GraphQLString },
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
    intakeDate: { type: GraphQLString },
    intakeSource: { type: GraphQLString },
    adoptionFee: { type: GraphQLFloat },
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: (): GraphQLFieldConfigMap<unknown, GraphQLContext> => ({
    register: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: EmailScalar },
        password: { type: GraphQLString },
        userRole: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        shelterName: { type: GraphQLString },
        shelterLocation: { type: GraphQLString },
        shelterPaymentEmail: { type: EmailScalar },
      },
      resolve(_, args: RegisterArgs, context: GraphQLContext) {
        return register(args, context);
      },
    },
    login: {
      type: UserType,
      args: {
        email: { type: EmailScalar },
        password: { type: GraphQLString },
        totpCode: { type: GraphQLString },
        backupCode: { type: GraphQLString },
      },
      resolve(_, args: LoginArgs, context: GraphQLContext) {
        return login(args, context);
      },
    },
    logout: {
      type: UserType,
      args: {
        _id: { type: GraphQLID },
      },
      resolve(_, args: LogoutArgs, context: GraphQLContext) {
        return logout(args, context);
      },
    },
    verifyUser: {
      type: UserType,
      args: {
        token: { type: GraphQLString },
      },
      resolve(_, args: VerifyUserArgs) {
        return verifyUser(args);
      },
    },
    userId: {
      type: UserType,
      args: {
        token: { type: GraphQLString },
      },
      resolve(_, args: VerifyUserArgs) {
        return userId(args);
      },
    },
    verifyEmail: {
      type: GraphQLBoolean,
      args: {
        token: { type: GraphQLString },
      },
      resolve(_, args: { token: string }) {
        return verifyEmail(args.token);
      },
    },
    resendEmailVerification: {
      type: GraphQLBoolean,
      args: {},
      resolve(_, _args: Record<string, never>, context: GraphQLContext) {
        const authenticatedUserId = requireAuth(context);
        return resendEmailVerification(authenticatedUserId);
      },
    },
    requestPasswordReset: {
      type: GraphQLBoolean,
      args: {
        email: { type: EmailScalar },
      },
      resolve(_, args: { email: string }) {
        return requestPasswordReset(args.email);
      },
    },
    resetPassword: {
      type: GraphQLBoolean,
      args: {
        token: { type: GraphQLString },
        newPassword: { type: GraphQLString },
      },
      resolve(_, args: { token: string; newPassword: string }) {
        return resetPassword(args.token, args.newPassword);
      },
    },
    setupTwoFactor: {
      type: TwoFactorSetupType,
      args: {},
      resolve(_, _args: Record<string, never>, context: GraphQLContext) {
        const authenticatedUserId = requireAuth(context);
        return setupTwoFactor(authenticatedUserId);
      },
    },
    confirmTwoFactor: {
      type: UserType,
      args: {
        totpCode: { type: GraphQLString },
      },
      resolve(_, args: { totpCode: string }, context: GraphQLContext) {
        const authenticatedUserId = requireAuth(context);
        return confirmTwoFactor(authenticatedUserId, args.totpCode);
      },
    },
    disableTwoFactor: {
      type: UserType,
      args: {
        password: { type: GraphQLString },
      },
      resolve(_, args: { password: string }, context: GraphQLContext) {
        const authenticatedUserId = requireAuth(context);
        return disableTwoFactor(authenticatedUserId, args.password);
      },
    },
    refreshAccessToken: {
      type: UserType,
      args: {},
      resolve(_, _args: Record<string, never>, context: GraphQLContext) {
        return refreshAccessToken(context);
      },
    },
    getActiveSessions: {
      type: new GraphQLList(AuthSessionType),
      args: {},
      resolve(_, _args: Record<string, never>, context: GraphQLContext) {
        const authenticatedUserId = requireAuth(context);
        return getActiveSessionsForUser(authenticatedUserId);
      },
    },
    revokeSession: {
      type: GraphQLBoolean,
      args: {
        sessionId: { type: GraphQLID },
      },
      async resolve(_, args: { sessionId: string }, context: GraphQLContext) {
        requireAuth(context);
        return revokeSessionById(args.sessionId, 'manual_revocation');
      },
    },
    completeGoogleOAuth: {
      type: UserType,
      args: {
        code: { type: GraphQLString },
        redirectUri: { type: GraphQLString },
      },
      resolve(_, args: { code: string; redirectUri: string }, context: GraphQLContext) {
        return completeGoogleOAuth(args.code, args.redirectUri, context);
      },
    },
    completeFacebookOAuth: {
      type: UserType,
      args: {
        code: { type: GraphQLString },
        redirectUri: { type: GraphQLString },
      },
      resolve(_, args: { code: string; redirectUri: string }, context: GraphQLContext) {
        return completeFacebookOAuth(args.code, args.redirectUri, context);
      },
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
        intakeDate: { type: GraphQLString },
        intakeSource: { type: GraphQLString },
        adoptionFee: { type: GraphQLFloat },
        applications: { type: GraphQLID },
        shelterId: { type: GraphQLID },
      },
      async resolve(_, args: AnimalArgs & { shelterId?: string }, context: GraphQLContext) {
        // Require authentication and shelter staff access
        if (args.shelterId) {
          await requireShelterStaff(context, args.shelterId);
        } else {
          requireAuth(context);
        }
        const newAnimal = new Animal({
          name: args.name,
          type: args.type,
          breed: args.breed || '',
          age: args.age,
          sex: args.sex,
          color: args.color,
          description: args.description,
          image: args.image,
          images: args.images || [],
          video: args.video,
          status: args.status || 'available',
          size: args.size,
          temperament: args.temperament || '',
          energyLevel: args.energyLevel,
          houseTrained: args.houseTrained,
          goodWithKids: args.goodWithKids,
          goodWithDogs: args.goodWithDogs,
          goodWithCats: args.goodWithCats,
          personalityTraits: args.personalityTraits || [],
          specialNeeds: args.specialNeeds || '',
          microchipId: args.microchipId || '',
          intakeDate: args.intakeDate ? new Date(args.intakeDate) : undefined,
          intakeSource: args.intakeSource || '',
          adoptionFee: args.adoptionFee,
        });
        await newAnimal.save();
        return newAnimal;
      },
    },
    deleteAnimal: {
      type: AnimalType,
      args: {
        _id: { type: GraphQLID },
        shelterId: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string; shelterId?: string }, context: GraphQLContext) {
        // Find the animal to get the shelter it belongs to
        const animal = await Animal.findById(args._id);
        if (!animal) return null;

        // Find the shelter that owns this animal
        const shelter = await Shelter.findOne({ animals: args._id });
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else if (args.shelterId) {
          await requireShelterStaff(context, args.shelterId);
        } else {
          requireAdmin(context);
        }

        return Animal.deleteOne({ _id: args._id });
      },
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
        intakeDate: { type: GraphQLString },
        intakeSource: { type: GraphQLString },
        adoptionFee: { type: GraphQLFloat },
        applications: { type: GraphQLID },
      },
      async resolve(_, args: AnimalArgs & { _id: string }, context: GraphQLContext) {
        const animal = await Animal.findById(args._id);
        if (!animal) return null;

        // Find the shelter that owns this animal and require staff access
        const shelter = await Shelter.findOne({ animals: args._id });
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        animal.name = args.name;
        animal.type = args.type;
        if (args.breed !== undefined) animal.breed = args.breed;
        animal.age = args.age;
        animal.sex = args.sex;
        animal.color = args.color;
        animal.description = args.description;
        animal.image = args.image;
        if (args.images !== undefined) animal.images = args.images;
        animal.video = args.video;
        if (args.status) animal.status = args.status as typeof animal.status;
        if (args.size !== undefined) animal.size = args.size as typeof animal.size;
        if (args.temperament !== undefined) animal.temperament = args.temperament;
        if (args.energyLevel !== undefined) animal.energyLevel = args.energyLevel as typeof animal.energyLevel;
        if (args.houseTrained !== undefined) animal.houseTrained = args.houseTrained;
        if (args.goodWithKids !== undefined) animal.goodWithKids = args.goodWithKids;
        if (args.goodWithDogs !== undefined) animal.goodWithDogs = args.goodWithDogs;
        if (args.goodWithCats !== undefined) animal.goodWithCats = args.goodWithCats;
        if (args.personalityTraits !== undefined) animal.personalityTraits = args.personalityTraits;
        if (args.specialNeeds !== undefined) animal.specialNeeds = args.specialNeeds;
        if (args.microchipId !== undefined) animal.microchipId = args.microchipId;
        if (args.intakeDate !== undefined) animal.intakeDate = args.intakeDate ? new Date(args.intakeDate) : undefined;
        if (args.intakeSource !== undefined) animal.intakeSource = args.intakeSource;
        if (args.adoptionFee !== undefined) animal.adoptionFee = args.adoptionFee;
        await animal.save();
        return animal;
      },
    },
    updateAnimalStatus: {
      type: AnimalType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string }, context: GraphQLContext) {
        const animal = await Animal.findById(args._id);
        if (!animal) return null;

        // Find the shelter that owns this animal and require staff access
        const shelter = await Shelter.findOne({ animals: args._id });
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        animal.status = args.status as typeof animal.status;
        await animal.save();
        await pubsub.publish(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED, {
          animalStatusChanged: animal,
        });
        return animal;
      },
    },
    newApplication: {
      type: ApplicationType,
      args: {
        animalId: { type: GraphQLString },
        userId: { type: GraphQLString },
        applicationData: { type: GraphQLString },
      },
      async resolve(_, args: ApplicationArgs, context: GraphQLContext) {
        // Users can only create applications for themselves
        const authenticatedUserId = requireAuth(context);
        if (args.userId !== authenticatedUserId && context.userRole !== 'admin') {
          throw new Error('You can only submit applications for yourself');
        }

        const { animalId, userId, applicationData } = args;
        const newApp = new Application({
          animalId,
          userId,
          applicationData,
          status: 'submitted',
          submittedAt: new Date(),
        });
        const animal = await Animal.findById(animalId);
        if (animal) {
          animal.applications.push(newApp._id);
          await animal.save();
          await newApp.save();
          const shelter = await Shelter.findOne({ animals: animal._id });
          await pubsub.publish(SUBSCRIPTION_EVENTS.NEW_APPLICATION, {
            newApplication: newApp,
            newApplicationShelterId: shelter?._id.toString(),
          });
          return newApp;
        }
        return null;
      },
    },
    deleteApplication: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const application = await Application.findById(args._id);
        if (!application) return null;

        // Find the shelter that owns the animal
        const animal = await Animal.findById(application.animalId);
        const shelter = animal ? await Shelter.findOne({ animals: animal._id }) : null;

        // Allow application owner or shelter staff to delete
        await requireApplicationAccess(
          context,
          application.userId.toString(),
          shelter?._id.toString()
        );

        return Application.deleteOne({ _id: args._id });
      },
    },
    editApplication: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
        animalId: { type: GraphQLString },
        applicationData: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; applicationData: string }, context: GraphQLContext) {
        const { _id, applicationData } = args;
        const application = await Application.findById(_id);
        if (!application) return null;

        // Only the application owner can edit their own application
        requireSelf(context, application.userId.toString());

        application.applicationData = applicationData;
        await application.save();
        return application;
      },
    },
    updateApplicationStatus: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string }, context: GraphQLContext) {
        const application = await Application.findById(args._id);
        if (!application) return null;

        // Find the shelter that owns the animal - only shelter staff can update status
        const animal = await Animal.findById(application.animalId);
        const shelter = animal ? await Shelter.findOne({ animals: animal._id }) : null;
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        application.status = args.status as typeof application.status;
        await application.save();
        await pubsub.publish(SUBSCRIPTION_EVENTS.APPLICATION_STATUS_CHANGED, {
          applicationStatusChanged: application,
        });
        return application;
      },
    },
    markNotificationRead: {
      type: NotificationType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        requireAuth(context);
        const notification = await NotificationModel.findById(args._id);
        if (!notification) return null;

        // Users can only mark their own notifications as read
        requireSelf(context, notification.userId.toString());

        notification.read = true;
        await notification.save();
        return notification;
      },
    },
    markAllNotificationsRead: {
      type: GraphQLString,
      args: { userId: { type: GraphQLString } },
      async resolve(_, args: { userId: string }, context: GraphQLContext) {
        // Users can only mark their own notifications as read
        requireSelf(context, args.userId);
        await NotificationModel.updateMany({ userId: args.userId, read: false }, { read: true });
        return 'success';
      },
    },
    createReview: {
      type: ReviewType,
      args: {
        userId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        rating: { type: GraphQLInt },
        comment: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { userId: string; shelterId: string; rating: number; comment?: string },
        context: GraphQLContext
      ) {
        // Users can only create reviews as themselves
        requireSelf(context, args.userId);

        const review = new ReviewModel({
          userId: args.userId,
          shelterId: args.shelterId,
          rating: args.rating,
          comment: args.comment || '',
        });
        await review.save();
        return review;
      },
    },
    addMedicalRecord: {
      type: AnimalType,
      args: {
        animalId: { type: GraphQLID },
        date: { type: DateScalar },
        recordType: { type: GraphQLString },
        description: { type: GraphQLString },
        veterinarian: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          date: Date;
          recordType: string;
          description: string;
          veterinarian?: string;
        },
        context: GraphQLContext
      ) {
        const animal = await Animal.findById(args.animalId);
        if (!animal) return null;

        // Find the shelter that owns this animal and require staff access
        const shelter = await Shelter.findOne({ animals: args.animalId });
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        if (!animal.medicalRecords) animal.medicalRecords = [];
        animal.medicalRecords.push({
          date: args.date.toISOString(),
          recordType: args.recordType,
          description: args.description,
          veterinarian: args.veterinarian || '',
        });
        await animal.save();
        return animal;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: EmailScalar },
      },
      async resolve(
        _,
        args: { _id: string; name?: string; email?: string },
        context: GraphQLContext
      ) {
        // Users can only update their own profile
        requireSelf(context, args._id);

        const user = await User.findById(args._id);
        if (user) {
          if (args.name) user.name = args.name;
          if (args.email) user.email = args.email;
          await user.save();
          return user;
        }
        return null;
      },
    },
    addFavorite: {
      type: UserType,
      args: {
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID },
      },
      async resolve(_, args: { userId: string; animalId: string }, context: GraphQLContext) {
        // Users can only modify their own favorites
        requireSelf(context, args.userId);

        const user = await User.findById(args.userId);
        if (user) {
          const alreadyFavorited = user.favorites.some((id) => id.toString() === args.animalId);
          if (!alreadyFavorited) {
            user.favorites.push(args.animalId as unknown as (typeof user.favorites)[0]);
            await user.save();
          }
          return user;
        }
        return null;
      },
    },
    removeFavorite: {
      type: UserType,
      args: {
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID },
      },
      async resolve(_, args: { userId: string; animalId: string }, context: GraphQLContext) {
        // Users can only modify their own favorites
        requireSelf(context, args.userId);

        const user = await User.findById(args.userId);
        if (user) {
          user.favorites = user.favorites.filter(
            (id) => id.toString() !== args.animalId
          ) as typeof user.favorites;
          await user.save();
          return user;
        }
        return null;
      },
    },
    newShelter: {
      type: ShelterType,
      args: {
        name: { type: GraphQLString },
        location: { type: GraphQLString },
        paymentEmail: { type: EmailScalar },
        phone: { type: GraphQLString },
        email: { type: EmailScalar },
        website: { type: URLScalar },
        hours: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      async resolve(_, args: ShelterArgs, context: GraphQLContext) {
        // Only authenticated users can create shelters
        requireAuth(context);

        const { name, location, paymentEmail, phone, email, website, hours, description } = args;
        const newShelter = new Shelter({
          name,
          location,
          paymentEmail,
          phone,
          email,
          website,
          hours,
          description,
        });
        await newShelter.save();
        return newShelter;
      },
    },
    deleteShelter: {
      type: ShelterType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        // Only admins can delete shelters
        requireAdmin(context);
        return Shelter.deleteOne({ _id: args._id });
      },
    },
    editShelter: {
      type: ShelterType,
      args: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        location: { type: GraphQLString },
        users: { type: GraphQLString },
        paymentEmail: { type: EmailScalar },
        phone: { type: GraphQLString },
        email: { type: EmailScalar },
        website: { type: URLScalar },
        hours: { type: GraphQLString },
        description: { type: GraphQLString },
        animals: { type: GraphQLString },
      },
      async resolve(_, args: ShelterArgs & { _id: string }, context: GraphQLContext) {
        // Only shelter staff can edit their shelter
        await requireShelterStaff(context, args._id);

        const {
          _id,
          name,
          location,
          users,
          paymentEmail,
          phone,
          email,
          website,
          hours,
          description,
          animals,
        } = args;
        const shelter = await Shelter.findById(_id);
        if (shelter) {
          shelter.name = name;
          shelter.location = location;
          if (users) shelter.users = users as unknown as typeof shelter.users;
          shelter.paymentEmail = paymentEmail;
          if (phone !== undefined) shelter.phone = phone;
          if (email !== undefined) shelter.email = email;
          if (website !== undefined) shelter.website = website;
          if (hours !== undefined) shelter.hours = hours;
          if (description !== undefined) shelter.description = description;
          if (animals) shelter.animals = animals as unknown as typeof shelter.animals;
          await shelter.save();
          return shelter;
        }
        return null;
      },
    },
    addShelterStaff: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        email: { type: EmailScalar },
      },
      async resolve(_, args: { shelterId: string; email: string }, context: GraphQLContext) {
        // Only shelter staff can add new staff
        await requireShelterStaff(context, args.shelterId);

        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) return null;
        const user = await User.findOne({ email: args.email });
        if (!user) throw new Error('User not found with that email');
        const alreadyStaff = shelter.users.some((id) => id.toString() === user._id.toString());
        if (alreadyStaff) throw new Error('User is already staff');
        shelter.users.push(user._id as unknown as (typeof shelter.users)[0]);
        user.userRole = 'shelter';
        user.shelterId = shelter._id as unknown as typeof user.shelterId;
        await user.save();
        await shelter.save();
        return shelter;
      },
    },
    removeShelterStaff: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLID },
      },
      async resolve(_, args: { shelterId: string; userId: string }, context: GraphQLContext) {
        // Only shelter staff can remove staff
        await requireShelterStaff(context, args.shelterId);

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
      },
    },
    createEvent: {
      type: EventType,
      args: {
        shelterId: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        date: { type: DateScalar },
        endDate: { type: DateScalar },
        location: { type: GraphQLString },
        eventType: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          title: string;
          description?: string;
          date: Date;
          endDate?: Date;
          location?: string;
          eventType?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create events
        await requireShelterStaff(context, args.shelterId);

        const event = new EventModel({
          shelterId: args.shelterId,
          title: args.title,
          description: args.description || '',
          date: args.date,
          endDate: args.endDate,
          location: args.location || '',
          eventType: args.eventType || 'other',
        });
        await event.save();
        return event;
      },
    },
    deleteEvent: {
      type: EventType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const event = await EventModel.findById(args._id);
        if (!event) return null;

        // Only shelter staff can delete events
        await requireShelterStaff(context, event.shelterId.toString());

        return EventModel.findByIdAndDelete(args._id);
      },
    },
    createDonation: {
      type: DonationType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLString },
        donorName: { type: GraphQLString },
        amount: { type: GraphQLFloat },
        message: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          userId?: string;
          donorName: string;
          amount: number;
          message?: string;
        },
        context: GraphQLContext
      ) {
        // Donations can be anonymous (no auth required) but if userId is provided, verify it matches
        if (
          args.userId &&
          context.userId &&
          args.userId !== context.userId &&
          context.userRole !== 'admin'
        ) {
          throw new Error('Cannot create donation for another user');
        }

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
          message: args.message?.trim() || '',
        });
        await donation.save();
        return donation;
      },
    },
    createFoster: {
      type: FosterType,
      args: {
        shelterId: { type: GraphQLID },
        animalId: { type: GraphQLID },
        userId: { type: GraphQLString },
        fosterName: { type: GraphQLString },
        fosterEmail: { type: EmailScalar },
        startDate: { type: DateScalar },
        endDate: { type: DateScalar },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          animalId: string;
          userId?: string;
          fosterName: string;
          fosterEmail?: string;
          startDate: Date;
          endDate?: Date;
          notes?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create foster records
        await requireShelterStaff(context, args.shelterId);

        const foster = new FosterModel({
          shelterId: args.shelterId,
          animalId: args.animalId,
          userId: args.userId || '',
          fosterName: args.fosterName,
          fosterEmail: args.fosterEmail || '',
          startDate: args.startDate,
          endDate: args.endDate,
          status: 'active',
          notes: args.notes || '',
        });
        await foster.save();
        return foster;
      },
    },
    updateFosterStatus: {
      type: FosterType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
        endDate: { type: DateScalar },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { _id: string; status?: string; endDate?: Date; notes?: string },
        context: GraphQLContext
      ) {
        const foster = await FosterModel.findById(args._id);
        if (!foster) return null;

        // Only shelter staff can update foster records
        await requireShelterStaff(context, foster.shelterId.toString());

        if (args.status) foster.status = args.status as typeof foster.status;
        if (args.endDate) foster.endDate = args.endDate;
        if (args.notes !== undefined) foster.notes = args.notes;
        await foster.save();
        return foster;
      },
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
        maxAge: { type: GraphQLInt },
      },
      async resolve(
        _,
        args: {
          userId: string;
          name: string;
          type?: string;
          breed?: string;
          sex?: string;
          color?: string;
          status?: string;
          minAge?: number;
          maxAge?: number;
        },
        context: GraphQLContext
      ) {
        // Users can only create saved searches for themselves
        requireSelf(context, args.userId);

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
          filters,
        });
        await savedSearch.save();
        return savedSearch;
      },
    },
    deleteSavedSearch: {
      type: SavedSearchType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const savedSearch = await SavedSearchModel.findById(args._id);
        if (!savedSearch) return null;

        // Users can only delete their own saved searches
        requireSelf(context, savedSearch.userId.toString());

        return SavedSearchModel.findByIdAndDelete(args._id);
      },
    },
    logActivity: {
      type: ActivityLogType,
      args: {
        shelterId: { type: GraphQLID },
        action: { type: GraphQLString },
        entityType: { type: GraphQLString },
        entityId: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          action: string;
          entityType: string;
          entityId?: string;
          description: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can log activity
        await requireShelterStaff(context, args.shelterId);

        const log = new ActivityLogModel({
          shelterId: args.shelterId,
          action: args.action,
          entityType: args.entityType,
          entityId: args.entityId || '',
          description: args.description,
        });
        await log.save();
        return log;
      },
    },
    verifyShelter: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        verified: { type: GraphQLBoolean },
      },
      async resolve(_, args: { shelterId: string; verified: boolean }, context: GraphQLContext) {
        // Only admins can verify shelters
        requireAdmin(context);

        const shelter = await Shelter.findById(args.shelterId);
        if (shelter) {
          shelter.verified = args.verified;
          shelter.verifiedAt = args.verified ? new Date() : undefined;
          await shelter.save();
          return shelter;
        }
        return null;
      },
    },
    createApplicationTemplate: {
      type: ApplicationTemplateType,
      args: {
        shelterId: { type: GraphQLID },
        name: { type: GraphQLString },
        fields: { type: new GraphQLList(TemplateFieldInput) },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          name: string;
          fields: Array<{
            label: string;
            fieldType: string;
            required?: boolean;
            options?: string[];
          }>;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create templates
        await requireShelterStaff(context, args.shelterId);

        const template = new ApplicationTemplateModel({
          shelterId: args.shelterId,
          name: args.name,
          fields: (args.fields || []).map((f) => ({
            label: f.label,
            fieldType: f.fieldType,
            required: f.required || false,
            options: f.options || [],
          })),
        });
        await template.save();
        return template;
      },
    },
    deleteApplicationTemplate: {
      type: ApplicationTemplateType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const template = await ApplicationTemplateModel.findById(args._id);
        if (!template) return null;

        // Only shelter staff can delete templates
        await requireShelterStaff(context, template.shelterId.toString());

        return ApplicationTemplateModel.findByIdAndDelete(args._id);
      },
    },
    bulkCreateAnimals: {
      type: new GraphQLList(AnimalType),
      args: {
        animals: { type: new GraphQLList(AnimalInput) },
        shelterId: { type: GraphQLID },
      },
      async resolve(
        _,
        args: {
          animals: Array<{
            name: string;
            type: string;
            breed?: string;
            age: number;
            sex: string;
            color: string;
            description: string;
            image?: string;
            images?: string[];
            video?: string;
            status?: string;
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
            intakeDate?: string;
            intakeSource?: string;
            adoptionFee?: number;
          }>;
          shelterId?: string;
        },
        context: GraphQLContext
      ) {
        // Require shelter staff access if shelterId is provided
        if (args.shelterId) {
          await requireShelterStaff(context, args.shelterId);
        } else {
          requireAdmin(context);
        }

        const created = [];
        for (const d of args.animals) {
          const newAnimal = new Animal({
            name: d.name,
            type: d.type,
            breed: d.breed || '',
            age: d.age,
            sex: d.sex,
            color: d.color,
            description: d.description,
            image: d.image || '',
            images: d.images || [],
            video: d.video || '',
            status: d.status || 'available',
            size: d.size,
            temperament: d.temperament || '',
            energyLevel: d.energyLevel,
            houseTrained: d.houseTrained,
            goodWithKids: d.goodWithKids,
            goodWithDogs: d.goodWithDogs,
            goodWithCats: d.goodWithCats,
            personalityTraits: d.personalityTraits || [],
            specialNeeds: d.specialNeeds || '',
            microchipId: d.microchipId || '',
            intakeDate: d.intakeDate ? new Date(d.intakeDate) : undefined,
            intakeSource: d.intakeSource || '',
            adoptionFee: d.adoptionFee,
          });
          await newAnimal.save();
          created.push(newAnimal);
        }
        if (args.shelterId) {
          const shelter = await Shelter.findById(args.shelterId);
          if (shelter) {
            for (const animal of created) {
              shelter.animals.push(animal._id as unknown as (typeof shelter.animals)[0]);
            }
            await shelter.save();
          }
        }
        return created;
      },
    },
    createSuccessStory: {
      type: SuccessStoryType,
      args: {
        userId: { type: GraphQLString },
        animalName: { type: GraphQLString },
        animalType: { type: GraphQLString },
        title: { type: GraphQLString },
        story: { type: GraphQLString },
        image: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          userId: string;
          animalName: string;
          animalType: string;
          title: string;
          story: string;
          image?: string;
        },
        context: GraphQLContext
      ) {
        // Users can only create stories as themselves
        requireSelf(context, args.userId);

        const { userId, animalName, animalType, title, story, image } = args;
        const successStory = new SuccessStoryModel({
          userId,
          animalName,
          animalType,
          title,
          story,
          image: image || '',
          createdAt: new Date(),
        });
        await successStory.save();
        return successStory;
      },
    },
    registerTerminalReader: {
      type: TerminalReaderType,
      args: {
        shelterId: { type: GraphQLID },
        registrationCode: { type: GraphQLString },
        label: { type: GraphQLString },
        location: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; registrationCode: string; label: string; location?: string },
        context: GraphQLContext
      ) {
        // Only shelter staff can register terminal readers
        await requireShelterStaff(context, args.shelterId);

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
          location: args.location,
        });

        const terminalReader = new TerminalReaderModel({
          shelterId: args.shelterId,
          stripeReaderId: reader.id,
          label: args.label,
          deviceType: reader.device_type || 'simulated',
          serialNumber: reader.serial_number || '',
          location: args.location || '',
          status: 'online',
          registeredAt: new Date(),
        });
        await terminalReader.save();
        return terminalReader;
      },
    },
    deleteTerminalReader: {
      type: TerminalReaderType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const reader = await TerminalReaderModel.findById(args._id);
        if (!reader) return null;

        // Only shelter staff can delete terminal readers
        await requireShelterStaff(context, reader.shelterId.toString());

        await stripeTerminal.deleteReader(reader.stripeReaderId);
        await TerminalReaderModel.deleteOne({ _id: args._id });
        return reader;
      },
    },
    createTerminalPaymentIntent: {
      type: PaymentIntentType,
      args: {
        shelterId: { type: GraphQLID },
        readerId: { type: GraphQLString },
        amount: { type: GraphQLInt },
        currency: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          readerId: string;
          amount: number;
          currency?: string;
          description?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create payment intents
        await requireShelterStaff(context, args.shelterId);

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
          description: args.description,
        });

        return {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          description: paymentIntent.description || '',
          clientSecret: paymentIntent.client_secret || '',
        };
      },
    },
    sendMessage: {
      type: MessageType,
      args: {
        senderId: { type: GraphQLString },
        recipientId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { senderId: string; recipientId: string; shelterId: string; content: string },
        context: GraphQLContext
      ) {
        // Users can only send messages as themselves
        requireSelf(context, args.senderId);

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
          createdAt: new Date(),
        });
        await message.save();
        return message;
      },
    },
    markMessagesRead: {
      type: GraphQLBoolean,
      args: {
        shelterId: { type: GraphQLString },
        userId: { type: GraphQLString },
        readerId: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; userId: string; readerId: string },
        context: GraphQLContext
      ) {
        // Only the recipient can mark messages as read
        requireSelf(context, args.readerId);

        await MessageModel.updateMany(
          {
            shelterId: args.shelterId,
            senderId: args.userId,
            recipientId: args.readerId,
            read: false,
          },
          { $set: { read: true } }
        );
        return true;
      },
    },
    addVolunteer: {
      type: VolunteerType,
      args: {
        shelterId: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: EmailScalar },
        phone: { type: GraphQLString },
        skills: { type: new GraphQLList(GraphQLString) },
        availability: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          name: string;
          email?: string;
          phone?: string;
          skills?: string[];
          availability?: string;
          notes?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can add volunteers
        await requireShelterStaff(context, args.shelterId);

        // Validate required fields
        if (!args.shelterId || !args.name || !args.name.trim()) {
          throw new Error('Shelter ID and volunteer name are required');
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
          notes: args.notes || '',
        });
        await volunteer.save();
        return volunteer;
      },
    },
    updateVolunteerStatus: {
      type: VolunteerType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string }, context: GraphQLContext) {
        const volunteer = await VolunteerModel.findById(args._id);
        if (!volunteer) return null;

        // Only shelter staff can update volunteer status
        await requireShelterStaff(context, volunteer.shelterId.toString());

        volunteer.status = args.status as typeof volunteer.status;
        await volunteer.save();
        return volunteer;
      },
    },
    logVolunteerHours: {
      type: VolunteerType,
      args: {
        _id: { type: GraphQLID },
        hours: { type: GraphQLInt },
      },
      async resolve(_, args: { _id: string; hours: number }, context: GraphQLContext) {
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

        // Only shelter staff can log volunteer hours
        await requireShelterStaff(context, volunteer.shelterId.toString());

        volunteer.totalHours += args.hours;
        await volunteer.save();
        return volunteer;
      },
    },
    addBehaviorNote: {
      type: BehaviorNoteType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        noteType: { type: GraphQLString },
        severity: { type: GraphQLString },
        content: { type: GraphQLString },
        author: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          shelterId: string;
          noteType: string;
          severity: string;
          content: string;
          author?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can add behavior notes
        await requireShelterStaff(context, args.shelterId);

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
          createdAt: new Date(),
        });
        await note.save();
        return note;
      },
    },
    resolveBehaviorNote: {
      type: BehaviorNoteType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const note = await BehaviorNoteModel.findById(args._id);
        if (!note) {
          throw new Error('Behavior note not found');
        }

        // Only shelter staff can resolve behavior notes
        await requireShelterStaff(context, note.shelterId.toString());

        note.resolved = true;
        note.resolvedAt = new Date();
        await note.save();
        return note;
      },
    },
    createAnnouncement: {
      type: AnnouncementType,
      args: {
        shelterId: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        category: { type: GraphQLString },
        author: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          title: string;
          content: string;
          category: string;
          author?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create announcements
        await requireShelterStaff(context, args.shelterId);

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
          createdAt: new Date(),
        });
        await announcement.save();
        return announcement;
      },
    },
    toggleAnnouncementPin: {
      type: AnnouncementType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const announcement = await AnnouncementModel.findById(args._id);
        if (!announcement) {
          throw new Error('Announcement not found');
        }

        // Only shelter staff can toggle announcement pins
        await requireShelterStaff(context, announcement.shelterId.toString());

        announcement.pinned = !announcement.pinned;
        await announcement.save();
        return announcement;
      },
    },
    deleteAnnouncement: {
      type: AnnouncementType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const announcement = await AnnouncementModel.findById(args._id);
        if (!announcement) return null;

        // Only shelter staff can delete announcements
        await requireShelterStaff(context, announcement.shelterId.toString());

        return AnnouncementModel.findByIdAndDelete(args._id);
      },
    },
    registerMicrochip: {
      type: MicrochipType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        chipNumber: { type: GraphQLString },
        manufacturer: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { animalId: string; shelterId: string; chipNumber: string; manufacturer?: string },
        context: GraphQLContext
      ) {
        // Only shelter staff can register microchips
        await requireShelterStaff(context, args.shelterId);

        if (!args.chipNumber || args.chipNumber.length < 9 || args.chipNumber.length > 15) {
          throw new Error('Chip number must be between 9 and 15 characters');
        }
        const existing = await MicrochipModel.findOne({ chipNumber: args.chipNumber });
        if (existing) {
          throw new Error('This microchip number is already registered');
        }
        const microchip = new MicrochipModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          chipNumber: args.chipNumber,
          manufacturer: args.manufacturer || '',
          status: 'registered',
          registrationDate: new Date(),
          createdAt: new Date(),
        });
        await microchip.save();
        return microchip;
      },
    },
    updateMicrochipStatus: {
      type: MicrochipType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string }, context: GraphQLContext) {
        const microchip = await MicrochipModel.findById(args._id);
        if (!microchip) throw new Error('Microchip not found');

        // Only shelter staff can update microchip status
        await requireShelterStaff(context, microchip.shelterId.toString());

        microchip.status = args.status as typeof microchip.status;
        await microchip.save();
        return microchip;
      },
    },
    addWeightRecord: {
      type: WeightRecordType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        weight: { type: GraphQLFloat },
        unit: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { animalId: string; shelterId: string; weight: number; unit: string; notes?: string },
        context: GraphQLContext
      ) {
        // Only shelter staff can add weight records
        await requireShelterStaff(context, args.shelterId);

        if (!args.weight || args.weight <= 0) {
          throw new Error('Weight must be a positive number');
        }
        if (args.weight > 5000) {
          throw new Error('Weight value seems unrealistic');
        }
        const record = new WeightRecordModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          weight: args.weight,
          unit: args.unit || 'lbs',
          notes: args.notes || '',
          recordedAt: new Date(),
          createdAt: new Date(),
        });
        await record.save();
        return record;
      },
    },
    addVaccination: {
      type: VaccinationType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        vaccineName: { type: GraphQLString },
        dateAdministered: { type: DateScalar },
        nextDueDate: { type: DateScalar },
        veterinarian: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          shelterId: string;
          vaccineName: string;
          dateAdministered: Date;
          nextDueDate?: Date;
          veterinarian?: string;
          notes?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can add vaccinations
        await requireShelterStaff(context, args.shelterId);

        if (!args.vaccineName) {
          throw new Error('Vaccine name is required');
        }
        const vaccination = new VaccinationModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          vaccineName: args.vaccineName,
          dateAdministered: args.dateAdministered,
          nextDueDate: args.nextDueDate,
          veterinarian: args.veterinarian || '',
          status: 'completed',
          notes: args.notes || '',
          createdAt: new Date(),
        });
        await vaccination.save();
        return vaccination;
      },
    },
    updateVaccinationStatus: {
      type: VaccinationType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string }, context: GraphQLContext) {
        const vaccination = await VaccinationModel.findById(args._id);
        if (!vaccination) throw new Error('Vaccination not found');

        // Only shelter staff can update vaccination status
        await requireShelterStaff(context, vaccination.shelterId.toString());

        vaccination.status = args.status as typeof vaccination.status;
        await vaccination.save();
        return vaccination;
      },
    },
    createAdoptionFee: {
      type: AdoptionFeeType,
      args: {
        shelterId: { type: GraphQLID },
        animalType: { type: GraphQLString },
        baseFee: { type: GraphQLFloat },
        seniorDiscount: { type: GraphQLFloat },
        specialNeedsDiscount: { type: GraphQLFloat },
        description: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          animalType: string;
          baseFee: number;
          seniorDiscount?: number;
          specialNeedsDiscount?: number;
          description?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create adoption fees
        await requireShelterStaff(context, args.shelterId);

        if (!args.baseFee || args.baseFee < 0) {
          throw new Error('Base fee must be a non-negative number');
        }
        const fee = new AdoptionFeeModel({
          shelterId: args.shelterId,
          animalType: args.animalType,
          baseFee: args.baseFee,
          seniorDiscount: args.seniorDiscount || 0,
          specialNeedsDiscount: args.specialNeedsDiscount || 0,
          description: args.description || '',
          active: true,
          createdAt: new Date(),
        });
        await fee.save();
        return fee;
      },
    },
    updateAdoptionFee: {
      type: AdoptionFeeType,
      args: {
        _id: { type: GraphQLID },
        baseFee: { type: GraphQLFloat },
        seniorDiscount: { type: GraphQLFloat },
        specialNeedsDiscount: { type: GraphQLFloat },
        active: { type: GraphQLBoolean },
      },
      async resolve(
        _,
        args: {
          _id: string;
          baseFee?: number;
          seniorDiscount?: number;
          specialNeedsDiscount?: number;
          active?: boolean;
        },
        context: GraphQLContext
      ) {
        const fee = await AdoptionFeeModel.findById(args._id);
        if (!fee) throw new Error('Adoption fee not found');

        // Only shelter staff can update adoption fees
        await requireShelterStaff(context, fee.shelterId.toString());

        if (args.baseFee !== undefined) fee.baseFee = args.baseFee;
        if (args.seniorDiscount !== undefined) fee.seniorDiscount = args.seniorDiscount;
        if (args.specialNeedsDiscount !== undefined)
          fee.specialNeedsDiscount = args.specialNeedsDiscount;
        if (args.active !== undefined) fee.active = args.active;
        await fee.save();
        return fee;
      },
    },
    updateSpayNeuter: {
      type: SpayNeuterType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        status: { type: GraphQLString },
        scheduledDate: { type: DateScalar },
        completedDate: { type: DateScalar },
        veterinarian: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          shelterId: string;
          status: string;
          scheduledDate?: Date;
          completedDate?: Date;
          veterinarian?: string;
          notes?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can update spay/neuter records
        await requireShelterStaff(context, args.shelterId);

        let record = await SpayNeuterModel.findOne({ animalId: args.animalId });
        if (!record) {
          record = new SpayNeuterModel({
            animalId: args.animalId,
            shelterId: args.shelterId,
            status: args.status,
            createdAt: new Date(),
          });
        }
        record.status = args.status as typeof record.status;
        if (args.scheduledDate) record.scheduledDate = args.scheduledDate;
        if (args.completedDate) record.completedDate = args.completedDate;
        if (args.veterinarian) record.veterinarian = args.veterinarian;
        if (args.notes) record.notes = args.notes;
        await record.save();
        return record;
      },
    },
    createIntakeLog: {
      type: IntakeLogType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        intakeType: { type: GraphQLString },
        intakeDate: { type: DateScalar },
        source: { type: GraphQLString },
        condition: { type: GraphQLString },
        notes: { type: GraphQLString },
        createdBy: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          shelterId: string;
          intakeType: string;
          intakeDate: Date;
          source?: string;
          condition?: string;
          notes?: string;
          createdBy?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create intake logs
        await requireShelterStaff(context, args.shelterId);

        const log = new IntakeLogModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          intakeType: args.intakeType,
          intakeDate: args.intakeDate,
          source: args.source || '',
          condition: args.condition || '',
          notes: args.notes || '',
          createdBy: args.createdBy || '',
          createdAt: new Date(),
        });
        await log.save();
        return log;
      },
    },
    createOutcomeLog: {
      type: OutcomeLogType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        outcomeType: { type: GraphQLString },
        outcomeDate: { type: DateScalar },
        destination: { type: GraphQLString },
        notes: { type: GraphQLString },
        createdBy: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          shelterId: string;
          outcomeType: string;
          outcomeDate: Date;
          destination?: string;
          notes?: string;
          createdBy?: string;
        },
        context: GraphQLContext
      ) {
        // Only shelter staff can create outcome logs
        await requireShelterStaff(context, args.shelterId);

        const log = new OutcomeLogModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          outcomeType: args.outcomeType,
          outcomeDate: args.outcomeDate,
          destination: args.destination || '',
          notes: args.notes || '',
          createdBy: args.createdBy || '',
          createdAt: new Date(),
        });
        await log.save();
        return log;
      },
    },
  }),
});

export default mutation;
