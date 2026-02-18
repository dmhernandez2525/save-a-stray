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
import { isValidTransition } from '../services/status-transitions';
import { StatusHistoryDocument } from '../models/StatusHistory';
import StatusHistoryType from './types/status_history_type';
import { MediaAssetDocument } from '../models/MediaAsset';
import { DashboardLayoutDocument } from '../models/DashboardLayout';
import DashboardLayoutType from './types/dashboard_layout_type';
import { StaffInvitationDocument } from '../models/StaffInvitation';
import StaffInvitationType from './types/staff_invitation_type';
import { ShelterStaffRoleDocument } from '../models/ShelterStaffRole';
import ShelterStaffRoleType from './types/shelter_staff_role_type';
import { InternalNoteDocument } from '../models/InternalNote';
import InternalNoteType from './types/internal_note_type';
import { KennelAssignmentDocument } from '../models/KennelAssignment';
import KennelAssignmentType from './types/kennel_assignment_type';
import { ApplicationReviewDocument } from '../models/ApplicationReview';
import ApplicationReviewType from './types/application_review_type';
import { RejectionTemplateDocument } from '../models/RejectionTemplate';
import { AdopterProfileDocument } from '../models/AdopterProfile';
import AdopterProfileType from './types/adopter_profile_type';
import { MatchRecordDocument } from '../models/MatchRecord';
import { AdoptionRecordDocument } from '../models/AdoptionRecord';
import AdoptionRecordType from './types/adoption_record_type';
import { PostAdoptionSurveyDocument } from '../models/PostAdoptionSurvey';
import { FosterProfileDocument, HousingDetail } from '../models/FosterProfile';
import FosterProfileType, {
  HousingDetailInput,
  PetExperienceInput,
  FosterReferenceInput,
} from './types/foster_profile_type';
import { ShelterSettingsDocument } from '../models/ShelterSettings';
import ShelterSettingsType, {
  DayScheduleInput,
  HolidayClosureInput,
  AdoptionRequirementsInput,
  NotificationPreferencesInput,
} from './types/shelter_settings_type';
import crypto from 'crypto';
import MediaAssetType from './types/media_asset_type';
import UploadSignatureType from './types/upload_signature_type';
import { generateUploadSignature, deleteImage, getThumbnailUrl, getMediumUrl, isValidVideoUrl } from '../services/cloudinary';
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
const StatusHistoryModel = mongoose.model<StatusHistoryDocument>('statusHistory');
const MediaAssetModel = mongoose.model<MediaAssetDocument>('mediaAsset');
const DashboardLayoutModel = mongoose.model<DashboardLayoutDocument>('dashboardLayout');
const StaffInvitationModel = mongoose.model<StaffInvitationDocument>('staffInvitation');
const ShelterStaffRoleModel = mongoose.model<ShelterStaffRoleDocument>('shelterStaffRole');
const InternalNoteModel = mongoose.model<InternalNoteDocument>('internalNote');
const KennelAssignmentModel = mongoose.model<KennelAssignmentDocument>('kennelAssignment');
const ApplicationReviewModel = mongoose.model<ApplicationReviewDocument>('applicationReview');
const RejectionTemplateModel = mongoose.model<RejectionTemplateDocument>('rejectionTemplate');
const AdopterProfileModel = mongoose.model<AdopterProfileDocument>('adopterProfile');
const MatchRecordModel = mongoose.model<MatchRecordDocument>('matchRecord');
const AdoptionRecordModel = mongoose.model<AdoptionRecordDocument>('adoptionRecord');
const PostAdoptionSurveyModel = mongoose.model<PostAdoptionSurveyDocument>('postAdoptionSurvey');
const ShelterSettingsModel = mongoose.model<ShelterSettingsDocument>('shelterSettings');
const FosterProfileModel = mongoose.model<FosterProfileDocument>('fosterProfile');

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
  latitude?: number;
  longitude?: number;
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
    placeholder: { type: GraphQLString },
    helpText: { type: GraphQLString },
  },
});

const CriterionScoreInput = new GraphQLInputObjectType({
  name: 'CriterionScoreInput',
  fields: {
    criterion: { type: GraphQLString },
    score: { type: GraphQLFloat },
    comment: { type: GraphQLString },
  },
});

const DashboardWidgetInput = new GraphQLInputObjectType({
  name: 'DashboardWidgetInput',
  fields: {
    widgetId: { type: GraphQLString },
    visible: { type: GraphQLBoolean },
    sortOrder: { type: GraphQLInt },
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
        reason: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string; reason?: string }, context: GraphQLContext) {
        const animal = await Animal.findById(args._id);
        if (!animal) return null;

        // Find the shelter that owns this animal and require staff access
        const shelter = await Shelter.findOne({ animals: args._id });
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        const fromStatus = animal.status;
        const toStatus = args.status as typeof animal.status;

        // Validate the transition (admins can override terminal state restrictions)
        if (!isValidTransition(fromStatus, toStatus) && context.userRole !== 'admin') {
          throw new Error(`Invalid status transition from "${fromStatus}" to "${toStatus}"`);
        }

        animal.status = toStatus;
        await animal.save();

        // Log the status change
        const historyEntry = new StatusHistoryModel({
          animalId: args._id,
          fromStatus,
          toStatus,
          changedBy: context.userId ?? '',
          reason: args.reason ?? '',
        });
        await historyEntry.save();

        await pubsub.publish(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED, {
          animalStatusChanged: animal,
        });
        return animal;
      },
    },
    bulkUpdateAnimalStatus: {
      type: new GraphQLList(AnimalType),
      args: {
        animalIds: { type: new GraphQLList(GraphQLID) },
        status: { type: GraphQLString },
        reason: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { animalIds: string[]; status: string; reason?: string },
        context: GraphQLContext
      ) {
        if (!args.animalIds || args.animalIds.length === 0) {
          throw new Error('At least one animal ID is required');
        }
        if (args.animalIds.length > 50) {
          throw new Error('Cannot update more than 50 animals at once');
        }

        const updated = [];
        for (const animalId of args.animalIds) {
          const animal = await Animal.findById(animalId);
          if (!animal) continue;

          const shelter = await Shelter.findOne({ animals: animalId });
          if (shelter) {
            await requireShelterStaff(context, shelter._id.toString());
          } else {
            requireAdmin(context);
          }

          const fromStatus = animal.status;
          const toStatus = args.status as typeof animal.status;

          if (!isValidTransition(fromStatus, toStatus) && context.userRole !== 'admin') {
            continue; // skip invalid transitions in bulk mode
          }

          animal.status = toStatus;
          await animal.save();

          const historyEntry = new StatusHistoryModel({
            animalId,
            fromStatus,
            toStatus,
            changedBy: context.userId ?? '',
            reason: args.reason ?? 'Bulk status update',
          });
          await historyEntry.save();

          await pubsub.publish(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED, {
            animalStatusChanged: animal,
          });
          updated.push(animal);
        }
        return updated;
      },
    },
    newApplication: {
      type: ApplicationType,
      args: {
        animalId: { type: GraphQLString },
        userId: { type: GraphQLString },
        applicationData: { type: GraphQLString },
        templateId: { type: GraphQLString },
        applicationFee: { type: GraphQLFloat },
      },
      async resolve(
        _,
        args: ApplicationArgs & { templateId?: string; applicationFee?: number },
        context: GraphQLContext
      ) {
        const authenticatedUserId = requireAuth(context);
        if (args.userId !== authenticatedUserId && context.userRole !== 'admin') {
          throw new Error('You can only submit applications for yourself');
        }

        // Duplicate detection: prevent multiple active applications for same animal
        const existing = await Application.findOne({
          userId: args.userId,
          animalId: args.animalId,
          status: { $in: ['submitted', 'under_review'] },
        });
        if (existing) {
          throw new Error('You already have an active application for this animal');
        }

        const { animalId, userId, applicationData } = args;
        const newApp = new Application({
          animalId,
          userId,
          applicationData,
          status: 'submitted',
          isDraft: false,
          templateId: args.templateId ?? '',
          applicationFee: args.applicationFee ?? 0,
          applicationFeeStatus: args.applicationFee ? 'pending' : 'none',
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
    saveApplicationDraft: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
        animalId: { type: GraphQLString },
        userId: { type: GraphQLString },
        applicationData: { type: GraphQLString },
        currentStep: { type: GraphQLInt },
        totalSteps: { type: GraphQLInt },
        templateId: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          _id?: string;
          animalId: string;
          userId: string;
          applicationData: string;
          currentStep?: number;
          totalSteps?: number;
          templateId?: string;
        },
        context: GraphQLContext
      ) {
        requireSelf(context, args.userId);

        // Update existing draft or create new one
        if (args._id) {
          const draft = await Application.findById(args._id);
          if (!draft) throw new Error('Draft not found');
          if (draft.userId !== args.userId) throw new Error('Not your draft');
          if (!draft.isDraft) throw new Error('Cannot modify a submitted application as draft');

          draft.applicationData = args.applicationData;
          if (args.currentStep !== undefined) draft.currentStep = args.currentStep;
          if (args.totalSteps !== undefined) draft.totalSteps = args.totalSteps;
          await draft.save();
          return draft;
        }

        const draft = new Application({
          animalId: args.animalId,
          userId: args.userId,
          applicationData: args.applicationData,
          status: 'draft',
          isDraft: true,
          currentStep: args.currentStep ?? 0,
          totalSteps: args.totalSteps ?? 1,
          templateId: args.templateId ?? '',
          submittedAt: new Date(),
        });
        await draft.save();
        return draft;
      },
    },
    submitDraft: {
      type: ApplicationType,
      args: {
        _id: { type: GraphQLID },
      },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const draft = await Application.findById(args._id);
        if (!draft) throw new Error('Draft not found');
        requireSelf(context, draft.userId);

        if (!draft.isDraft) throw new Error('Application is already submitted');

        // Check for duplicates before submitting
        const existing = await Application.findOne({
          _id: { $ne: draft._id },
          userId: draft.userId,
          animalId: draft.animalId,
          status: { $in: ['submitted', 'under_review'] },
        });
        if (existing) {
          throw new Error('You already have an active application for this animal');
        }

        draft.isDraft = false;
        draft.status = 'submitted';
        draft.submittedAt = new Date();
        await draft.save();

        const animal = await Animal.findById(draft.animalId);
        if (animal) {
          const alreadyLinked = animal.applications.some(id => id.toString() === draft._id.toString());
          if (!alreadyLinked) {
            animal.applications.push(draft._id);
            await animal.save();
          }
          const shelter = await Shelter.findOne({ animals: animal._id });
          await pubsub.publish(SUBSCRIPTION_EVENTS.NEW_APPLICATION, {
            newApplication: draft,
            newApplicationShelterId: shelter?._id.toString(),
          });
        }
        return draft;
      },
    },
    withdrawApplication: {
      type: ApplicationType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const application = await Application.findById(args._id);
        if (!application) throw new Error('Application not found');
        requireSelf(context, application.userId);

        if (application.status === 'approved' || application.status === 'rejected') {
          throw new Error('Cannot withdraw an application that has already been finalized');
        }

        application.status = 'withdrawn';
        await application.save();
        return application;
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

        // Auto-status rule: when application is approved, set animal to "pending"
        if (args.status === 'approved' && animal && animal.status === 'available') {
          const fromStatus = animal.status;
          animal.status = 'pending';
          await animal.save();
          const historyEntry = new StatusHistoryModel({
            animalId: animal._id.toString(),
            fromStatus,
            toStatus: 'pending',
            changedBy: context.userId ?? '',
            reason: 'Auto-set: application approved',
          });
          await historyEntry.save();
          await pubsub.publish(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED, {
            animalStatusChanged: animal,
          });
        }

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
        latitude: { type: GraphQLFloat },
        longitude: { type: GraphQLFloat },
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

        const shelterData: Record<string, unknown> = {
          name: args.name,
          location: args.location,
          paymentEmail: args.paymentEmail,
          phone: args.phone,
          email: args.email,
          website: args.website,
          hours: args.hours,
          description: args.description,
        };
        if (args.latitude !== undefined && args.longitude !== undefined) {
          shelterData.coordinates = {
            type: 'Point',
            coordinates: [args.longitude, args.latitude],
          };
        }
        const newShelter = new Shelter(shelterData);
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
        latitude: { type: GraphQLFloat },
        longitude: { type: GraphQLFloat },
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

        const shelter = await Shelter.findById(args._id);
        if (shelter) {
          shelter.name = args.name;
          shelter.location = args.location;
          if (args.latitude !== undefined && args.longitude !== undefined) {
            shelter.coordinates = {
              type: 'Point',
              coordinates: [args.longitude, args.latitude],
            };
          }
          if (args.users) shelter.users = args.users as unknown as typeof shelter.users;
          shelter.paymentEmail = args.paymentEmail;
          if (args.phone !== undefined) shelter.phone = args.phone;
          if (args.email !== undefined) shelter.email = args.email;
          if (args.website !== undefined) shelter.website = args.website;
          if (args.hours !== undefined) shelter.hours = args.hours;
          if (args.description !== undefined) shelter.description = args.description;
          if (args.animals) shelter.animals = args.animals as unknown as typeof shelter.animals;
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
        size: { type: GraphQLString },
        energyLevel: { type: GraphQLString },
        goodWithKids: { type: GraphQLBoolean },
        goodWithDogs: { type: GraphQLBoolean },
        goodWithCats: { type: GraphQLBoolean },
        houseTrained: { type: GraphQLBoolean },
        minAge: { type: GraphQLInt },
        maxAge: { type: GraphQLInt },
        alertsEnabled: { type: GraphQLBoolean },
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
          size?: string;
          energyLevel?: string;
          goodWithKids?: boolean;
          goodWithDogs?: boolean;
          goodWithCats?: boolean;
          houseTrained?: boolean;
          minAge?: number;
          maxAge?: number;
          alertsEnabled?: boolean;
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
        if (args.size) filters.size = args.size;
        if (args.energyLevel) filters.energyLevel = args.energyLevel;
        if (args.goodWithKids !== undefined) filters.goodWithKids = args.goodWithKids;
        if (args.goodWithDogs !== undefined) filters.goodWithDogs = args.goodWithDogs;
        if (args.goodWithCats !== undefined) filters.goodWithCats = args.goodWithCats;
        if (args.houseTrained !== undefined) filters.houseTrained = args.houseTrained;
        if (args.minAge !== undefined) filters.minAge = args.minAge;
        if (args.maxAge !== undefined) filters.maxAge = args.maxAge;
        const savedSearch = new SavedSearchModel({
          userId: args.userId,
          name: args.name,
          filters,
          alertsEnabled: args.alertsEnabled ?? false,
        });
        await savedSearch.save();
        return savedSearch;
      },
    },
    toggleSearchAlerts: {
      type: SavedSearchType,
      args: {
        _id: { type: GraphQLID },
        alertsEnabled: { type: GraphQLBoolean },
      },
      async resolve(_, args: { _id: string; alertsEnabled: boolean }, context: GraphQLContext) {
        const savedSearch = await SavedSearchModel.findById(args._id);
        if (!savedSearch) return null;
        requireSelf(context, savedSearch.userId.toString());
        savedSearch.alertsEnabled = args.alertsEnabled;
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
        animalType: { type: GraphQLString },
        fields: { type: new GraphQLList(TemplateFieldInput) },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          name: string;
          animalType?: string;
          fields: Array<{
            label: string;
            fieldType: string;
            required?: boolean;
            options?: string[];
            placeholder?: string;
            helpText?: string;
          }>;
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const template = new ApplicationTemplateModel({
          shelterId: args.shelterId,
          name: args.name,
          animalType: args.animalType ?? '',
          fields: (args.fields || []).map((f) => ({
            label: f.label,
            fieldType: f.fieldType,
            required: f.required || false,
            options: f.options || [],
            placeholder: f.placeholder || '',
            helpText: f.helpText || '',
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
    generateUploadSignature: {
      type: UploadSignatureType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
      },
      async resolve(_, args: { animalId?: string; shelterId?: string }, context: GraphQLContext) {
        if (args.shelterId) {
          await requireShelterStaff(context, args.shelterId);
        } else {
          requireAuth(context);
        }
        const folder = args.animalId
          ? `save-a-stray/animals/${args.animalId}`
          : 'save-a-stray/uploads';
        return generateUploadSignature(folder);
      },
    },
    registerMediaAsset: {
      type: MediaAssetType,
      args: {
        animalId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        publicId: { type: GraphQLString },
        url: { type: GraphQLString },
        width: { type: GraphQLInt },
        height: { type: GraphQLInt },
        mimeType: { type: GraphQLString },
        sizeBytes: { type: GraphQLInt },
      },
      async resolve(
        _,
        args: {
          animalId: string;
          shelterId: string;
          publicId: string;
          url: string;
          width?: number;
          height?: number;
          mimeType?: string;
          sizeBytes?: number;
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const existingCount = await MediaAssetModel.countDocuments({ animalId: args.animalId });
        if (existingCount >= 20) {
          throw new Error('Maximum of 20 media assets per animal');
        }

        const asset = new MediaAssetModel({
          animalId: args.animalId,
          shelterId: args.shelterId,
          publicId: args.publicId,
          url: args.url,
          thumbnailUrl: getThumbnailUrl(args.publicId),
          mediumUrl: getMediumUrl(args.publicId),
          width: args.width ?? 0,
          height: args.height ?? 0,
          mimeType: args.mimeType ?? 'image/jpeg',
          sizeBytes: args.sizeBytes ?? 0,
          uploadedBy: context.userId ?? '',
          sortOrder: existingCount,
        });
        await asset.save();
        return asset;
      },
    },
    deleteMediaAsset: {
      type: MediaAssetType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const asset = await MediaAssetModel.findById(args._id);
        if (!asset) return null;

        await requireShelterStaff(context, asset.shelterId);

        await deleteImage(asset.publicId);
        await MediaAssetModel.deleteOne({ _id: args._id });
        return asset;
      },
    },
    reorderAnimalMedia: {
      type: new GraphQLList(MediaAssetType),
      args: {
        animalId: { type: GraphQLID },
        orderedIds: { type: new GraphQLList(GraphQLID) },
      },
      async resolve(_, args: { animalId: string; orderedIds: string[] }, context: GraphQLContext) {
        const animal = await Animal.findById(args.animalId);
        if (!animal) throw new Error('Animal not found');

        const shelter = await Shelter.findOne({ animals: args.animalId });
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        for (let i = 0; i < args.orderedIds.length; i++) {
          await MediaAssetModel.updateOne(
            { _id: args.orderedIds[i], animalId: args.animalId },
            { sortOrder: i }
          );
        }
        return MediaAssetModel.find({ animalId: args.animalId }).sort({ sortOrder: 1 });
      },
    },
    trackMediaView: {
      type: MediaAssetType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }) {
        const asset = await MediaAssetModel.findById(args._id);
        if (!asset) return null;
        asset.viewCount = (asset.viewCount || 0) + 1;
        await asset.save();
        return asset;
      },
    },
    validateVideoUrl: {
      type: GraphQLBoolean,
      args: { url: { type: GraphQLString } },
      resolve(_, args: { url: string }) {
        return isValidVideoUrl(args.url);
      },
    },
    inviteStaff: {
      type: StaffInvitationType,
      args: {
        shelterId: { type: GraphQLID },
        email: { type: EmailScalar },
        role: { type: GraphQLString },
      },
      async resolve(_, args: { shelterId: string; email: string; role: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);
        const validRoles = ['admin', 'staff', 'volunteer', 'readonly'];
        if (!validRoles.includes(args.role)) {
          throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
        const existing = await StaffInvitationModel.findOne({
          shelterId: args.shelterId,
          email: args.email,
          status: 'pending',
        });
        if (existing) throw new Error('An invitation is already pending for this email');

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = new StaffInvitationModel({
          shelterId: args.shelterId,
          email: args.email,
          role: args.role,
          invitedBy: context.userId ?? '',
          token,
          expiresAt,
        });
        await invitation.save();
        return invitation;
      },
    },
    acceptStaffInvitation: {
      type: ShelterStaffRoleType,
      args: { token: { type: GraphQLString } },
      async resolve(_, args: { token: string }, context: GraphQLContext) {
        const userId = requireAuth(context);
        const invitation = await StaffInvitationModel.findOne({ token: args.token, status: 'pending' });
        if (!invitation) throw new Error('Invalid or expired invitation');
        if (new Date() > invitation.expiresAt) {
          invitation.status = 'expired';
          await invitation.save();
          throw new Error('Invitation has expired');
        }

        invitation.status = 'accepted';
        await invitation.save();

        const staffRole = await ShelterStaffRoleModel.findOneAndUpdate(
          { shelterId: invitation.shelterId, userId },
          { role: invitation.role, assignedBy: invitation.invitedBy },
          { upsert: true, new: true }
        );

        // Also add user to shelter.users if not already there
        const shelter = await Shelter.findById(invitation.shelterId);
        if (shelter) {
          const alreadyStaff = shelter.users.some(id => id.toString() === userId);
          if (!alreadyStaff) {
            shelter.users.push(userId as unknown as (typeof shelter.users)[0]);
            await shelter.save();
          }
        }

        const user = await User.findById(userId);
        if (user && user.userRole !== 'admin') {
          user.userRole = 'shelter';
          user.shelterId = invitation.shelterId as unknown as typeof user.shelterId;
          await user.save();
        }

        return staffRole;
      },
    },
    updateStaffRole: {
      type: ShelterStaffRoleType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLID },
        role: { type: GraphQLString },
      },
      async resolve(_, args: { shelterId: string; userId: string; role: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);
        const validRoles = ['admin', 'staff', 'volunteer', 'readonly'];
        if (!validRoles.includes(args.role)) {
          throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
        const staffRole = await ShelterStaffRoleModel.findOneAndUpdate(
          { shelterId: args.shelterId, userId: args.userId },
          { role: args.role, assignedBy: context.userId ?? '' },
          { upsert: true, new: true }
        );
        return staffRole;
      },
    },
    assignAnimalToStaff: {
      type: ShelterStaffRoleType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID },
      },
      async resolve(_, args: { shelterId: string; userId: string; animalId: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);
        const staffRole = await ShelterStaffRoleModel.findOne({ shelterId: args.shelterId, userId: args.userId });
        if (!staffRole) throw new Error('Staff member not found');
        if (!staffRole.assignedAnimals.includes(args.animalId)) {
          staffRole.assignedAnimals.push(args.animalId);
          await staffRole.save();
        }
        return staffRole;
      },
    },
    unassignAnimalFromStaff: {
      type: ShelterStaffRoleType,
      args: {
        shelterId: { type: GraphQLID },
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID },
      },
      async resolve(_, args: { shelterId: string; userId: string; animalId: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);
        const staffRole = await ShelterStaffRoleModel.findOne({ shelterId: args.shelterId, userId: args.userId });
        if (!staffRole) throw new Error('Staff member not found');
        staffRole.assignedAnimals = staffRole.assignedAnimals.filter(id => id !== args.animalId);
        await staffRole.save();
        return staffRole;
      },
    },
    addInternalNote: {
      type: InternalNoteType,
      args: {
        shelterId: { type: GraphQLID },
        entityType: { type: GraphQLString },
        entityId: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      async resolve(_, args: { shelterId: string; entityType: string; entityId?: string; content: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);
        if (!args.content || args.content.length > 5000) {
          throw new Error('Content is required and must be less than 5000 characters');
        }
        const note = new InternalNoteModel({
          shelterId: args.shelterId,
          entityType: args.entityType || 'general',
          entityId: args.entityId || '',
          content: args.content,
          author: context.userId ?? '',
        });
        await note.save();
        return note;
      },
    },
    deleteInternalNote: {
      type: InternalNoteType,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const note = await InternalNoteModel.findById(args._id);
        if (!note) return null;
        await requireShelterStaff(context, note.shelterId);
        return InternalNoteModel.findByIdAndDelete(args._id);
      },
    },
    saveDashboardLayout: {
      type: DashboardLayoutType,
      args: {
        shelterId: { type: GraphQLID },
        widgets: { type: new GraphQLList(DashboardWidgetInput) },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          widgets: Array<{ widgetId: string; visible: boolean; sortOrder: number }>;
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);
        const userId = requireAuth(context);

        const layout = await DashboardLayoutModel.findOneAndUpdate(
          { userId, shelterId: args.shelterId },
          { widgets: args.widgets, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        return layout;
      },
    },
    assignKennel: {
      type: KennelAssignmentType,
      args: {
        shelterId: { type: GraphQLID },
        kennelId: { type: GraphQLString },
        kennelName: { type: GraphQLString },
        animalId: { type: GraphQLID },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; kennelId: string; kennelName?: string; animalId: string; notes?: string },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        // Check if kennel is already occupied
        const existing = await KennelAssignmentModel.findOne({
          shelterId: args.shelterId,
          kennelId: args.kennelId,
          status: 'occupied',
        });
        if (existing) throw new Error('Kennel is already occupied');

        // Check shelter capacity
        const shelter = await Shelter.findById(args.shelterId);
        if (shelter?.maxCapacity) {
          const occupiedCount = await KennelAssignmentModel.countDocuments({
            shelterId: args.shelterId,
            status: 'occupied',
          });
          if (occupiedCount >= shelter.maxCapacity) {
            throw new Error('Shelter is at maximum capacity');
          }
        }

        const assignment = new KennelAssignmentModel({
          shelterId: args.shelterId,
          kennelId: args.kennelId,
          kennelName: args.kennelName ?? '',
          animalId: args.animalId,
          assignedAt: new Date(),
          status: 'occupied',
          notes: args.notes ?? '',
        });
        await assignment.save();
        return assignment;
      },
    },
    releaseKennel: {
      type: KennelAssignmentType,
      args: {
        _id: { type: GraphQLID },
        notes: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; notes?: string }, context: GraphQLContext) {
        const assignment = await KennelAssignmentModel.findById(args._id);
        if (!assignment) throw new Error('Kennel assignment not found');

        await requireShelterStaff(context, assignment.shelterId);

        assignment.status = 'vacant';
        assignment.releasedAt = new Date();
        if (args.notes !== undefined) assignment.notes = args.notes;
        await assignment.save();
        return assignment;
      },
    },
    updateKennelStatus: {
      type: KennelAssignmentType,
      args: {
        _id: { type: GraphQLID },
        status: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; status: string; notes?: string }, context: GraphQLContext) {
        const assignment = await KennelAssignmentModel.findById(args._id);
        if (!assignment) throw new Error('Kennel assignment not found');

        await requireShelterStaff(context, assignment.shelterId);

        const validStatuses = ['occupied', 'vacant', 'maintenance'];
        if (!validStatuses.includes(args.status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        assignment.status = args.status as typeof assignment.status;
        if (args.notes !== undefined) assignment.notes = args.notes;
        if (args.status === 'vacant') assignment.releasedAt = new Date();
        await assignment.save();
        return assignment;
      },
    },
    generateAnimalId: {
      type: GraphQLString,
      args: {
        shelterId: { type: GraphQLID },
      },
      async resolve(_, args: { shelterId: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);

        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) throw new Error('Shelter not found');

        const prefix = shelter.animalIdPrefix || 'ANM';
        const seq = shelter.nextAnimalIdSequence || 1;
        const paddedSeq = String(seq).padStart(5, '0');
        const generatedId = `${prefix}-${paddedSeq}`;

        shelter.nextAnimalIdSequence = seq + 1;
        await shelter.save();

        return generatedId;
      },
    },
    updateShelterCapacity: {
      type: ShelterType,
      args: {
        shelterId: { type: GraphQLID },
        maxCapacity: { type: GraphQLInt },
        animalIdPrefix: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; maxCapacity?: number; animalIdPrefix?: string },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) throw new Error('Shelter not found');

        if (args.maxCapacity !== undefined) {
          if (args.maxCapacity < 0 || args.maxCapacity > 10000) {
            throw new Error('Max capacity must be between 0 and 10000');
          }
          shelter.maxCapacity = args.maxCapacity;
        }
        if (args.animalIdPrefix !== undefined) {
          if (args.animalIdPrefix.length > 10) {
            throw new Error('Animal ID prefix must be 10 characters or less');
          }
          shelter.animalIdPrefix = args.animalIdPrefix;
        }
        await shelter.save();
        return shelter;
      },
    },
    updateShelterBranding: {
      type: ShelterSettingsType,
      args: {
        shelterId: { type: GraphQLID },
        logo: { type: GraphQLString },
        primaryColor: { type: GraphQLString },
        customCertificateTemplate: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; logo?: string; primaryColor?: string; customCertificateTemplate?: string },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const update: Record<string, unknown> = { updatedAt: new Date() };
        if (args.logo !== undefined) update.logo = args.logo;
        if (args.primaryColor !== undefined) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(args.primaryColor)) {
            throw new Error('Primary color must be a valid hex color (e.g. #4F46E5)');
          }
          update.primaryColor = args.primaryColor;
        }
        if (args.customCertificateTemplate !== undefined) {
          update.customCertificateTemplate = args.customCertificateTemplate;
        }

        return ShelterSettingsModel.findOneAndUpdate(
          { shelterId: args.shelterId },
          { $set: update },
          { upsert: true, new: true }
        );
      },
    },
    updateShelterSchedule: {
      type: ShelterSettingsType,
      args: {
        shelterId: { type: GraphQLID },
        timezone: { type: GraphQLString },
        weeklySchedule: { type: new GraphQLList(DayScheduleInput) },
        holidayClosures: { type: new GraphQLList(HolidayClosureInput) },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          timezone?: string;
          weeklySchedule?: Array<{ day: string; open: string; close: string; closed: boolean }>;
          holidayClosures?: Array<{ date: string; reason: string }>;
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const update: Record<string, unknown> = { updatedAt: new Date() };
        if (args.timezone !== undefined) update.timezone = args.timezone;
        if (args.weeklySchedule !== undefined) update.weeklySchedule = args.weeklySchedule;
        if (args.holidayClosures !== undefined) {
          update.holidayClosures = args.holidayClosures.map(h => ({
            date: new Date(h.date),
            reason: h.reason || '',
          }));
        }

        return ShelterSettingsModel.findOneAndUpdate(
          { shelterId: args.shelterId },
          { $set: update },
          { upsert: true, new: true }
        );
      },
    },
    updateAdoptionPolicy: {
      type: ShelterSettingsType,
      args: {
        shelterId: { type: GraphQLID },
        adoptionPolicy: { type: GraphQLString },
        adoptionRequirements: { type: AdoptionRequirementsInput },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          adoptionPolicy?: string;
          adoptionRequirements?: {
            minAdopterAge?: number;
            homeVisitRequired?: boolean;
            referencesRequired?: number;
            fenceRequired?: boolean;
            landlordApproval?: boolean;
          };
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const update: Record<string, unknown> = { updatedAt: new Date() };
        if (args.adoptionPolicy !== undefined) update.adoptionPolicy = args.adoptionPolicy;
        if (args.adoptionRequirements !== undefined) {
          update.adoptionRequirements = args.adoptionRequirements;
        }

        return ShelterSettingsModel.findOneAndUpdate(
          { shelterId: args.shelterId },
          { $set: update },
          { upsert: true, new: true }
        );
      },
    },
    updateNotificationPreferences: {
      type: ShelterSettingsType,
      args: {
        shelterId: { type: GraphQLID },
        preferences: { type: NotificationPreferencesInput },
      },
      async resolve(
        _,
        args: {
          shelterId: string;
          preferences: {
            newApplication?: boolean;
            statusChange?: boolean;
            capacityAlert?: boolean;
            newMessage?: boolean;
            volunteerSignup?: boolean;
            donationReceived?: boolean;
          };
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        return ShelterSettingsModel.findOneAndUpdate(
          { shelterId: args.shelterId },
          { $set: { notificationPreferences: args.preferences, updatedAt: new Date() } },
          { upsert: true, new: true }
        );
      },
    },
    updateShelterIntegration: {
      type: ShelterSettingsType,
      args: {
        shelterId: { type: GraphQLID },
        integrationName: { type: GraphQLString },
        enabled: { type: GraphQLBoolean },
        apiKey: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; integrationName: string; enabled: boolean; apiKey?: string },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const validIntegrations = ['petfinder', 'adoptapet', 'cloudinary'];
        if (!validIntegrations.includes(args.integrationName)) {
          throw new Error(`Invalid integration. Must be one of: ${validIntegrations.join(', ')}`);
        }

        return ShelterSettingsModel.findOneAndUpdate(
          { shelterId: args.shelterId },
          {
            $set: {
              [`integrations.${args.integrationName}`]: {
                enabled: args.enabled,
                apiKey: args.apiKey ?? '',
              },
              updatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      },
    },
    addVerificationDocument: {
      type: ShelterSettingsType,
      args: {
        shelterId: { type: GraphQLID },
        documentUrl: { type: GraphQLString },
      },
      async resolve(_, args: { shelterId: string; documentUrl: string }, context: GraphQLContext) {
        await requireShelterStaff(context, args.shelterId);

        if (!args.documentUrl) throw new Error('Document URL is required');

        return ShelterSettingsModel.findOneAndUpdate(
          { shelterId: args.shelterId },
          {
            $push: { verificationDocuments: args.documentUrl },
            $set: { updatedAt: new Date() },
          },
          { upsert: true, new: true }
        );
      },
    },
    submitApplicationReview: {
      type: ApplicationReviewType,
      args: {
        applicationId: { type: GraphQLID },
        scores: { type: new GraphQLList(CriterionScoreInput) },
        overallScore: { type: GraphQLFloat },
        recommendation: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          applicationId: string;
          scores: Array<{ criterion: string; score: number; comment?: string }>;
          overallScore: number;
          recommendation: string;
          notes?: string;
        },
        context: GraphQLContext
      ) {
        const reviewerId = requireAuth(context);

        const application = await Application.findById(args.applicationId);
        if (!application) throw new Error('Application not found');

        // Verify reviewer has shelter access
        const animal = await Animal.findById(application.animalId);
        const shelter = animal ? await Shelter.findOne({ animals: animal._id }) : null;
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        const validRecs = ['approve', 'reject', 'needs_info', 'undecided'];
        if (!validRecs.includes(args.recommendation)) {
          throw new Error(`Invalid recommendation. Must be one of: ${validRecs.join(', ')}`);
        }

        if (args.overallScore < 0 || args.overallScore > 5) {
          throw new Error('Overall score must be between 0 and 5');
        }

        const review = await ApplicationReviewModel.findOneAndUpdate(
          { applicationId: args.applicationId, reviewerId },
          {
            scores: (args.scores || []).map(s => ({
              criterion: s.criterion,
              score: Math.min(5, Math.max(1, s.score)),
              comment: s.comment ?? '',
            })),
            overallScore: args.overallScore,
            recommendation: args.recommendation,
            notes: args.notes ?? '',
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        // If application is still submitted, move to under_review
        if (application.status === 'submitted') {
          application.status = 'under_review';
          await application.save();
        }

        return review;
      },
    },
    finalizeApplicationDecision: {
      type: ApplicationType,
      args: {
        applicationId: { type: GraphQLID },
        decision: { type: GraphQLString },
        reviewNotes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { applicationId: string; decision: string; reviewNotes?: string },
        context: GraphQLContext
      ) {
        const reviewerId = requireAuth(context);

        const application = await Application.findById(args.applicationId);
        if (!application) throw new Error('Application not found');

        const animal = await Animal.findById(application.animalId);
        const shelter = animal ? await Shelter.findOne({ animals: animal._id }) : null;
        if (shelter) {
          await requireShelterStaff(context, shelter._id.toString());
        } else {
          requireAdmin(context);
        }

        if (args.decision !== 'approved' && args.decision !== 'rejected') {
          throw new Error('Decision must be "approved" or "rejected"');
        }

        application.status = args.decision as typeof application.status;
        application.reviewNotes = args.reviewNotes ?? '';
        application.reviewedBy = reviewerId;
        application.reviewedAt = new Date();
        await application.save();

        // Auto-status rule: approved => animal pending
        if (args.decision === 'approved' && animal && animal.status === 'available') {
          const fromStatus = animal.status;
          animal.status = 'pending';
          await animal.save();
          const historyEntry = new StatusHistoryModel({
            animalId: animal._id.toString(),
            fromStatus,
            toStatus: 'pending',
            changedBy: reviewerId,
            reason: 'Application approved',
          });
          await historyEntry.save();
          await pubsub.publish(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED, {
            animalStatusChanged: animal,
          });
        }

        await pubsub.publish(SUBSCRIPTION_EVENTS.APPLICATION_STATUS_CHANGED, {
          applicationStatusChanged: application,
        });
        return application;
      },
    },
    createRejectionTemplate: {
      type: GraphQLString,
      args: {
        shelterId: { type: GraphQLID },
        name: { type: GraphQLString },
        subject: { type: GraphQLString },
        body: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { shelterId: string; name: string; subject?: string; body: string },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        if (!args.body || args.body.length > 5000) {
          throw new Error('Body is required and must be less than 5000 characters');
        }

        const template = new RejectionTemplateModel({
          shelterId: args.shelterId,
          name: args.name,
          subject: args.subject ?? 'Application Update',
          body: args.body,
        });
        await template.save();
        return template._id.toString();
      },
    },
    deleteRejectionTemplate: {
      type: GraphQLBoolean,
      args: { _id: { type: GraphQLID } },
      async resolve(_, args: { _id: string }, context: GraphQLContext) {
        const template = await RejectionTemplateModel.findById(args._id);
        if (!template) return false;
        await requireShelterStaff(context, template.shelterId);
        await RejectionTemplateModel.deleteOne({ _id: args._id });
        return true;
      },
    },
    saveAdopterProfile: {
      type: AdopterProfileType,
      args: {
        housingType: { type: GraphQLString },
        hasYard: { type: GraphQLBoolean },
        yardSize: { type: GraphQLString },
        activityLevel: { type: GraphQLString },
        hoursAwayPerDay: { type: GraphQLInt },
        hasChildren: { type: GraphQLBoolean },
        childrenAges: { type: GraphQLString },
        hasOtherPets: { type: GraphQLBoolean },
        otherPetTypes: { type: new GraphQLList(GraphQLString) },
        experienceLevel: { type: GraphQLString },
        preferredSize: { type: new GraphQLList(GraphQLString) },
        preferredEnergyLevel: { type: new GraphQLList(GraphQLString) },
        preferredAge: { type: GraphQLString },
        preferredSpecies: { type: new GraphQLList(GraphQLString) },
        allergies: { type: GraphQLString },
        specialConsiderations: { type: GraphQLString },
      },
      async resolve(
        _,
        args: Record<string, unknown>,
        context: GraphQLContext
      ) {
        const userId = requireAuth(context);

        const update: Record<string, unknown> = { updatedAt: new Date() };
        const fields = [
          'housingType', 'hasYard', 'yardSize', 'activityLevel', 'hoursAwayPerDay',
          'hasChildren', 'childrenAges', 'hasOtherPets', 'otherPetTypes', 'experienceLevel',
          'preferredSize', 'preferredEnergyLevel', 'preferredAge', 'preferredSpecies',
          'allergies', 'specialConsiderations',
        ];
        for (const field of fields) {
          if (args[field] !== undefined) update[field] = args[field];
        }

        return AdopterProfileModel.findOneAndUpdate(
          { userId },
          { $set: update, $setOnInsert: { completedAt: new Date() } },
          { upsert: true, new: true }
        );
      },
    },
    recordMatchOutcome: {
      type: GraphQLBoolean,
      args: {
        userId: { type: GraphQLID },
        animalId: { type: GraphQLID },
        score: { type: GraphQLInt },
        outcome: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { userId: string; animalId: string; score: number; outcome: string },
        context: GraphQLContext
      ) {
        requireSelf(context, args.userId);

        const validOutcomes = ['suggested', 'viewed', 'applied', 'adopted', 'dismissed'];
        if (!validOutcomes.includes(args.outcome)) {
          throw new Error(`Invalid outcome. Must be one of: ${validOutcomes.join(', ')}`);
        }

        await MatchRecordModel.findOneAndUpdate(
          { userId: args.userId, animalId: args.animalId },
          { score: args.score, outcome: args.outcome },
          { upsert: true, new: true }
        );
        return true;
      },
    },
    createAdoptionRecord: {
      type: AdoptionRecordType,
      args: {
        animalId: { type: GraphQLID },
        adopterId: { type: GraphQLID },
        shelterId: { type: GraphQLID },
        applicationId: { type: GraphQLString },
        feeAmount: { type: GraphQLFloat },
        feeStatus: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          animalId: string; adopterId: string; shelterId: string;
          applicationId?: string; feeAmount?: number; feeStatus?: string; notes?: string;
        },
        context: GraphQLContext
      ) {
        await requireShelterStaff(context, args.shelterId);

        const adoptionDate = new Date();
        // Schedule follow-ups at 1 week, 1 month, 6 months
        const followUps = [
          { type: '1_week', scheduledDate: new Date(adoptionDate.getTime() + 7 * 24 * 60 * 60 * 1000), status: 'pending' as const, notes: '' },
          { type: '1_month', scheduledDate: new Date(adoptionDate.getTime() + 30 * 24 * 60 * 60 * 1000), status: 'pending' as const, notes: '' },
          { type: '6_months', scheduledDate: new Date(adoptionDate.getTime() + 180 * 24 * 60 * 60 * 1000), status: 'pending' as const, notes: '' },
        ];

        const record = new AdoptionRecordModel({
          animalId: args.animalId,
          adopterId: args.adopterId,
          shelterId: args.shelterId,
          applicationId: args.applicationId ?? '',
          adoptionDate,
          feeAmount: args.feeAmount ?? 0,
          feeStatus: args.feeStatus ?? 'pending',
          followUps,
          notes: args.notes ?? '',
        });
        await record.save();

        // Update animal status to adopted
        const animal = await Animal.findById(args.animalId);
        if (animal && animal.status !== 'adopted') {
          const fromStatus = animal.status;
          animal.status = 'adopted';
          await animal.save();
          const historyEntry = new StatusHistoryModel({
            animalId: args.animalId,
            fromStatus,
            toStatus: 'adopted',
            changedBy: context.userId ?? '',
            reason: 'Adoption completed',
          });
          await historyEntry.save();
          await pubsub.publish(SUBSCRIPTION_EVENTS.ANIMAL_STATUS_CHANGED, {
            animalStatusChanged: animal,
          });
        }

        return record;
      },
    },
    updateAdoptionFeeStatus: {
      type: AdoptionRecordType,
      args: {
        _id: { type: GraphQLID },
        feeStatus: { type: GraphQLString },
        paymentIntentId: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; feeStatus: string; paymentIntentId?: string }, context: GraphQLContext) {
        const record = await AdoptionRecordModel.findById(args._id);
        if (!record) throw new Error('Adoption record not found');
        await requireShelterStaff(context, record.shelterId);

        record.feeStatus = args.feeStatus as typeof record.feeStatus;
        if (args.paymentIntentId) record.paymentIntentId = args.paymentIntentId;
        await record.save();
        return record;
      },
    },
    signAdoptionContract: {
      type: AdoptionRecordType,
      args: {
        _id: { type: GraphQLID },
        contractUrl: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; contractUrl: string }, context: GraphQLContext) {
        requireAuth(context);
        const record = await AdoptionRecordModel.findById(args._id);
        if (!record) throw new Error('Adoption record not found');

        record.contractUrl = args.contractUrl;
        record.contractSignedAt = new Date();
        await record.save();
        return record;
      },
    },
    generateAdoptionCertificate: {
      type: AdoptionRecordType,
      args: {
        _id: { type: GraphQLID },
        certificateUrl: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; certificateUrl: string }, context: GraphQLContext) {
        const record = await AdoptionRecordModel.findById(args._id);
        if (!record) throw new Error('Adoption record not found');
        await requireShelterStaff(context, record.shelterId);

        record.certificateUrl = args.certificateUrl;
        await record.save();
        return record;
      },
    },
    completeFollowUp: {
      type: AdoptionRecordType,
      args: {
        adoptionRecordId: { type: GraphQLID },
        followUpId: { type: GraphQLID },
        notes: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(
        _,
        args: { adoptionRecordId: string; followUpId: string; notes?: string; status?: string },
        context: GraphQLContext
      ) {
        const record = await AdoptionRecordModel.findById(args.adoptionRecordId);
        if (!record) throw new Error('Adoption record not found');
        await requireShelterStaff(context, record.shelterId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const followUp = record.followUps.find(
          (f: any) => f._id?.toString() === args.followUpId
        );
        if (!followUp) throw new Error('Follow-up not found');

        followUp.status = (args.status as 'completed' | 'skipped') ?? 'completed';
        followUp.completedDate = new Date();
        if (args.notes !== undefined) followUp.notes = args.notes;
        await record.save();
        return record;
      },
    },
    recordAdoptionReturn: {
      type: AdoptionRecordType,
      args: {
        _id: { type: GraphQLID },
        returnReason: { type: GraphQLString },
      },
      async resolve(_, args: { _id: string; returnReason: string }, context: GraphQLContext) {
        const record = await AdoptionRecordModel.findById(args._id);
        if (!record) throw new Error('Adoption record not found');
        await requireShelterStaff(context, record.shelterId);

        record.returnDate = new Date();
        record.returnReason = args.returnReason ?? '';
        await record.save();

        // Return animal to available
        const animal = await Animal.findById(record.animalId);
        if (animal && animal.status === 'adopted') {
          animal.status = 'available';
          await animal.save();
          const historyEntry = new StatusHistoryModel({
            animalId: record.animalId,
            fromStatus: 'adopted',
            toStatus: 'available',
            changedBy: context.userId ?? '',
            reason: `Returned: ${args.returnReason ?? 'No reason given'}`,
          });
          await historyEntry.save();
        }

        return record;
      },
    },
    submitPostAdoptionSurvey: {
      type: GraphQLBoolean,
      args: {
        adoptionRecordId: { type: GraphQLID },
        animalId: { type: GraphQLID },
        overallSatisfaction: { type: GraphQLInt },
        animalAdjustment: { type: GraphQLInt },
        shelterExperience: { type: GraphQLInt },
        wouldRecommend: { type: GraphQLBoolean },
        challenges: { type: GraphQLString },
        positives: { type: GraphQLString },
        additionalComments: { type: GraphQLString },
      },
      async resolve(
        _,
        args: {
          adoptionRecordId: string; animalId: string;
          overallSatisfaction: number; animalAdjustment: number; shelterExperience: number;
          wouldRecommend?: boolean; challenges?: string; positives?: string; additionalComments?: string;
        },
        context: GraphQLContext
      ) {
        const adopterId = requireAuth(context);

        const existing = await PostAdoptionSurveyModel.findOne({ adoptionRecordId: args.adoptionRecordId });
        if (existing) throw new Error('Survey already submitted for this adoption');

        for (const field of ['overallSatisfaction', 'animalAdjustment', 'shelterExperience'] as const) {
          if (args[field] < 1 || args[field] > 5) {
            throw new Error(`${field} must be between 1 and 5`);
          }
        }

        const survey = new PostAdoptionSurveyModel({
          adoptionRecordId: args.adoptionRecordId,
          adopterId,
          animalId: args.animalId,
          overallSatisfaction: args.overallSatisfaction,
          animalAdjustment: args.animalAdjustment,
          shelterExperience: args.shelterExperience,
          wouldRecommend: args.wouldRecommend ?? true,
          challenges: args.challenges ?? '',
          positives: args.positives ?? '',
          additionalComments: args.additionalComments ?? '',
        });
        await survey.save();
        return true;
      },
    },

    // F5.1 - Foster Registration
    registerFosterProfile: {
      type: FosterProfileType,
      args: {
        shelterId: { type: GraphQLString },
        bio: { type: GraphQLString },
        photoUrl: { type: GraphQLString },
        maxAnimals: { type: GraphQLInt },
        acceptedAnimalTypes: { type: new GraphQLList(GraphQLString) },
        specialSkills: { type: new GraphQLList(GraphQLString) },
        housing: { type: HousingDetailInput },
        experience: { type: new GraphQLList(PetExperienceInput) },
        references: { type: new GraphQLList(FosterReferenceInput) },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        const userId = requireAuth(context);
        if (!args.shelterId) throw new Error('shelterId is required');
        const existing = await FosterProfileModel.findOne({
          userId,
          shelterId: args.shelterId as string,
        });
        if (existing) throw new Error('Foster profile already exists for this shelter');
        const profile = new FosterProfileModel({
          userId,
          shelterId: args.shelterId,
          bio: args.bio ?? '',
          photoUrl: args.photoUrl ?? '',
          maxAnimals: args.maxAnimals ?? 1,
          acceptedAnimalTypes: args.acceptedAnimalTypes ?? [],
          specialSkills: args.specialSkills ?? [],
          housing: args.housing ?? {},
          experience: args.experience ?? [],
          references: args.references ?? [],
          status: 'pending_approval',
        });
        await profile.save();
        return profile;
      },
    },
    updateFosterProfile: {
      type: FosterProfileType,
      args: {
        shelterId: { type: GraphQLString },
        bio: { type: GraphQLString },
        photoUrl: { type: GraphQLString },
        maxAnimals: { type: GraphQLInt },
        acceptedAnimalTypes: { type: new GraphQLList(GraphQLString) },
        specialSkills: { type: new GraphQLList(GraphQLString) },
        housing: { type: HousingDetailInput },
        experience: { type: new GraphQLList(PetExperienceInput) },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        const userId = requireAuth(context);
        if (!args.shelterId) throw new Error('shelterId is required');
        const profile = await FosterProfileModel.findOne({
          userId,
          shelterId: args.shelterId as string,
        });
        if (!profile) throw new Error('Foster profile not found');
        if (args.bio !== undefined) profile.bio = args.bio as string;
        if (args.photoUrl !== undefined) profile.photoUrl = args.photoUrl as string;
        if (args.maxAnimals !== undefined) profile.maxAnimals = args.maxAnimals as number;
        if (args.acceptedAnimalTypes) profile.acceptedAnimalTypes = args.acceptedAnimalTypes as string[];
        if (args.specialSkills) profile.specialSkills = args.specialSkills as string[];
        if (args.housing) {
          const h = args.housing as Record<string, unknown>;
          if (h.type !== undefined) profile.housing.type = h.type as HousingDetail['type'];
          if (h.ownershipStatus !== undefined) profile.housing.ownershipStatus = h.ownershipStatus as 'own' | 'rent';
          if (h.hasYard !== undefined) profile.housing.hasYard = h.hasYard as boolean;
          if (h.yardFenced !== undefined) profile.housing.yardFenced = h.yardFenced as boolean;
          if (h.squareFootage !== undefined) profile.housing.squareFootage = h.squareFootage as number;
          if (h.landlordApproval !== undefined) profile.housing.landlordApproval = h.landlordApproval as boolean;
          if (h.landlordContact !== undefined) profile.housing.landlordContact = h.landlordContact as string;
          if (h.documentUrls) profile.housing.documentUrls = h.documentUrls as string[];
        }
        if (args.experience) profile.experience = args.experience as typeof profile.experience;
        await profile.save();
        return profile;
      },
    },
    verifyFosterHousing: {
      type: FosterProfileType,
      args: {
        fosterProfileId: { type: GraphQLString },
        verificationStatus: { type: GraphQLString },
        verificationNotes: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        requireAuth(context);
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        requireShelterStaff(context, profile.shelterId);
        const validStatuses = ['pending', 'verified', 'rejected'];
        if (!validStatuses.includes(args.verificationStatus as string)) {
          throw new Error('Invalid verification status');
        }
        profile.housing.verificationStatus = args.verificationStatus as 'pending' | 'verified' | 'rejected';
        if (args.verificationNotes) profile.housing.verificationNotes = args.verificationNotes as string;
        await profile.save();
        return profile;
      },
    },
    addFosterReference: {
      type: FosterProfileType,
      args: {
        shelterId: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        relationship: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        const userId = requireAuth(context);
        const profile = await FosterProfileModel.findOne({
          userId,
          shelterId: args.shelterId as string,
        });
        if (!profile) throw new Error('Foster profile not found');
        profile.references.push({
          name: args.name as string,
          email: args.email as string,
          phone: (args.phone as string) ?? '',
          relationship: (args.relationship as string) ?? '',
          status: 'pending',
          comments: '',
        });
        await profile.save();
        return profile;
      },
    },
    sendReferenceRequest: {
      type: GraphQLBoolean,
      args: {
        fosterProfileId: { type: GraphQLString },
        referenceId: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        requireAuth(context);
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        requireShelterStaff(context, profile.shelterId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ref = profile.references.find(
          (r: any) => r._id?.toString() === args.referenceId
        );
        if (!ref) throw new Error('Reference not found');
        ref.status = 'sent';
        ref.requestSentAt = new Date();
        await profile.save();
        return true;
      },
    },
    submitReferenceResponse: {
      type: GraphQLBoolean,
      args: {
        fosterProfileId: { type: GraphQLString },
        referenceId: { type: GraphQLString },
        rating: { type: GraphQLInt },
        comments: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>) {
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ref = profile.references.find(
          (r: any) => r._id?.toString() === args.referenceId
        );
        if (!ref) throw new Error('Reference not found');
        ref.status = 'received';
        ref.responseReceivedAt = new Date();
        if (args.rating) ref.rating = args.rating as number;
        if (args.comments) ref.comments = args.comments as string;
        await profile.save();
        return true;
      },
    },
    signFosterAgreement: {
      type: FosterProfileType,
      args: {
        shelterId: { type: GraphQLString },
        agreementUrl: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        const userId = requireAuth(context);
        const profile = await FosterProfileModel.findOne({
          userId,
          shelterId: args.shelterId as string,
        });
        if (!profile) throw new Error('Foster profile not found');
        profile.agreementUrl = (args.agreementUrl as string) ?? '';
        profile.agreementSignedAt = new Date();
        await profile.save();
        return profile;
      },
    },
    updateFosterOrientation: {
      type: FosterProfileType,
      args: {
        fosterProfileId: { type: GraphQLString },
        module: { type: GraphQLString },
        completed: { type: GraphQLBoolean },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        requireAuth(context);
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        requireShelterStaff(context, profile.shelterId);
        const item = profile.orientation.find(
          (o: { module: string }) => o.module === args.module
        );
        if (item) {
          item.completedAt = args.completed ? new Date() : undefined;
        } else {
          profile.orientation.push({
            module: args.module as string,
            completedAt: args.completed ? new Date() : undefined,
            required: true,
          });
        }
        await profile.save();
        return profile;
      },
    },
    updateFosterBackgroundCheck: {
      type: FosterProfileType,
      args: {
        fosterProfileId: { type: GraphQLString },
        backgroundCheckStatus: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        requireAuth(context);
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        requireShelterStaff(context, profile.shelterId);
        const validStatuses = ['not_started', 'pending', 'passed', 'failed'];
        if (!validStatuses.includes(args.backgroundCheckStatus as string)) {
          throw new Error('Invalid background check status');
        }
        profile.backgroundCheckStatus = args.backgroundCheckStatus as FosterProfileDocument['backgroundCheckStatus'];
        profile.backgroundCheckDate = new Date();
        await profile.save();
        return profile;
      },
    },
    updateFosterProfileStatus: {
      type: FosterProfileType,
      args: {
        fosterProfileId: { type: GraphQLString },
        status: { type: GraphQLString },
        reason: { type: GraphQLString },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        requireAuth(context);
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        requireShelterStaff(context, profile.shelterId);
        const validStatuses = ['pending_approval', 'active', 'on_hold', 'inactive'];
        if (!validStatuses.includes(args.status as string)) {
          throw new Error('Invalid foster status');
        }
        const transitionRules: Record<string, string[]> = {
          pending_approval: ['active', 'inactive'],
          active: ['on_hold', 'inactive'],
          on_hold: ['active', 'inactive'],
          inactive: ['pending_approval'],
        };
        const allowed = transitionRules[profile.status] ?? [];
        if (!allowed.includes(args.status as string)) {
          throw new Error(`Cannot transition from ${profile.status} to ${args.status}`);
        }
        profile.status = args.status as FosterProfileDocument['status'];
        profile.statusReason = (args.reason as string) ?? '';
        await profile.save();
        return profile;
      },
    },
    addFosterOrientationModules: {
      type: FosterProfileType,
      args: {
        fosterProfileId: { type: GraphQLString },
        modules: { type: new GraphQLList(GraphQLString) },
        required: { type: GraphQLBoolean },
      },
      async resolve(_parent: unknown, args: Record<string, unknown>, context: GraphQLContext) {
        requireAuth(context);
        const profile = await FosterProfileModel.findById(args.fosterProfileId);
        if (!profile) throw new Error('Foster profile not found');
        requireShelterStaff(context, profile.shelterId);
        const modules = args.modules as string[];
        const isRequired = args.required !== false;
        for (const mod of modules) {
          const exists = profile.orientation.some(
            (o: { module: string }) => o.module === mod
          );
          if (!exists) {
            profile.orientation.push({ module: mod, required: isRequired });
          }
        }
        await profile.save();
        return profile;
      },
    },
  }),
});

export default mutation;
