import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLFieldConfigMap
} from 'graphql';
import { isMongoConnected, mockAnimals, filterMockAnimals, mockPlatformStats, mockSuccessStories } from '../../mockData';
import UserType from './user_type';
import AnimalType from './animal_type';
import ApplicationType from './application_type';
import ShelterType from './shelter_type';
import SuccessStoryType from './success_story_type';
import ShelterAnalyticsType from './shelter_analytics_type';
import ReviewType from './review_type';
import NotificationType from './notification_type';
import { NotificationDocument } from '../../models/Notification';
import EventType from './event_type';
import DonationType from './donation_type';
import PlatformStatsType from './platform_stats_type';
import FosterType from './foster_type';
import SavedSearchType from './saved_search_type';
import ApplicationTemplateType from './application_template_type';
import ActivityLogType from './activity_log_type';
import TerminalReaderType from './terminal_reader_type';
import MessageType from './message_type';
import VolunteerType from './volunteer_type';
import BehaviorNoteType from './behavior_note_type';
import AnnouncementType from './announcement_type';
import MicrochipType from './microchip_type';
import WeightRecordType from './weight_record_type';
import VaccinationType from './vaccination_type';
import AdoptionFeeType from './adoption_fee_type';
import SpayNeuterType from './spay_neuter_type';
import IntakeLogType from './intake_log_type';
import OutcomeLogType from './outcome_log_type';
import AnimalTimelineEntryType from './animal_timeline_type';
import StatusHistoryType from './status_history_type';
import { StatusHistoryDocument } from '../../models/StatusHistory';
import { MediaAssetDocument } from '../../models/MediaAsset';
import MediaAssetType from './media_asset_type';
import { DashboardLayoutDocument } from '../../models/DashboardLayout';
import DashboardLayoutType from './dashboard_layout_type';
import { StaffInvitationDocument } from '../../models/StaffInvitation';
import StaffInvitationType from './staff_invitation_type';
import { ShelterStaffRoleDocument } from '../../models/ShelterStaffRole';
import ShelterStaffRoleType from './shelter_staff_role_type';
import { InternalNoteDocument } from '../../models/InternalNote';
import InternalNoteType from './internal_note_type';
import { KennelAssignmentDocument } from '../../models/KennelAssignment';
import KennelAssignmentType from './kennel_assignment_type';
import { ShelterSettingsDocument } from '../../models/ShelterSettings';
import ShelterSettingsType from './shelter_settings_type';
import { ApplicationReviewDocument } from '../../models/ApplicationReview';
import ApplicationReviewType from './application_review_type';
import { RejectionTemplateDocument } from '../../models/RejectionTemplate';
import { AdopterProfileDocument } from '../../models/AdopterProfile';
import AdopterProfileType from './adopter_profile_type';
import { MatchRecordDocument } from '../../models/MatchRecord';
import { calculateMatchScore } from '../../services/matching';
import { AdoptionRecordDocument } from '../../models/AdoptionRecord';
import AdoptionRecordType from './adoption_record_type';
import { PostAdoptionSurveyDocument } from '../../models/PostAdoptionSurvey';
import { FosterProfileDocument } from '../../models/FosterProfile';
import FosterProfileType from './foster_profile_type';
import { FosterPlacementDocument } from '../../models/FosterPlacement';
import FosterPlacementType from './foster_placement_type';
import { calculateFosterMatchScore, isAvailable } from '../../services/foster-matching';
import { FosterUpdateDocument } from '../../models/FosterUpdate';
import FosterUpdateType from './foster_update_type';
import { MessageThreadDocument } from '../../models/MessageThread';
import MessageThreadType from './message_thread_type';
import { MessageTemplateDocument } from '../../models/MessageTemplate';
import MessageTemplateType from './message_template_type';
import { EmailPreferenceDocument } from '../../models/EmailPreference';
import EmailPreferenceType from './email_preference_type';
import { EmailLogDocument } from '../../models/EmailLog';
import EmailLogType from './email_log_type';
import { PushSubscriptionDocument } from '../../models/PushSubscription';
import { NotificationPreferenceDocument } from '../../models/NotificationPreference';
import { ScheduledNotificationDocument } from '../../models/ScheduledNotification';
import { ShareEventDocument } from '../../models/ShareEvent';
import { AuthSessionDocument } from '../../models/AuthSession';
import { paginationQueryFields } from './pagination_queries';
import { GraphQLContext } from '../../graphql/context';
import { requireAuth } from '../../graphql/authorization';
import { EventDocument } from '../../models/Event';
import { DonationDocument } from '../../models/Donation';
import { FosterDocument } from '../../models/Foster';
import { SavedSearchDocument } from '../../models/SavedSearch';
import { ApplicationTemplateDocument } from '../../models/ApplicationTemplate';
import { ActivityLogDocument } from '../../models/ActivityLog';
import { TerminalReaderDocument } from '../../models/TerminalReader';
import { MessageDocument } from '../../models/Message';
import { VolunteerDocument } from '../../models/Volunteer';
import { BehaviorNoteDocument } from '../../models/BehaviorNote';
import { AnnouncementDocument } from '../../models/Announcement';
import { MicrochipDocument } from '../../models/Microchip';
import { WeightRecordDocument } from '../../models/WeightRecord';
import { VaccinationDocument } from '../../models/Vaccination';
import { AdoptionFeeDocument } from '../../models/AdoptionFee';
import { SpayNeuterDocument } from '../../models/SpayNeuter';
import { IntakeLogDocument } from '../../models/IntakeLog';
import { OutcomeLogDocument } from '../../models/OutcomeLog';
import { ApplicationDocument } from '../../models/Application';
import { AnimalDocument } from '../../models/Animal';
import { UserDocument } from '../../models/User';
import { ShelterDocument } from '../../models/Shelter';
import { SuccessStoryDocument } from '../../models/SuccessStory';
import { ReviewDocument } from '../../models/Review';

const DEFAULT_ANIMAL_LIMIT = 50;
const MAX_ANIMAL_LIMIT = 100;

const clampLimit = (limit: number | undefined, fallback: number, max: number): number => {
  if (limit === undefined || Number.isNaN(limit)) {
    return fallback;
  }
  if (limit < 1) {
    return 1;
  }
  return Math.min(limit, max);
};

const Application = mongoose.model<ApplicationDocument>('application');
const Animal = mongoose.model<AnimalDocument>('animal');
const User = mongoose.model<UserDocument>('user');
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
const ShelterSettingsModel = mongoose.model<ShelterSettingsDocument>('shelterSettings');
const ApplicationReviewModel = mongoose.model<ApplicationReviewDocument>('applicationReview');
const RejectionTemplateModel = mongoose.model<RejectionTemplateDocument>('rejectionTemplate');
const AdopterProfileModel = mongoose.model<AdopterProfileDocument>('adopterProfile');
const MatchRecordModel = mongoose.model<MatchRecordDocument>('matchRecord');
const AdoptionRecordModel = mongoose.model<AdoptionRecordDocument>('adoptionRecord');
const PostAdoptionSurveyModel = mongoose.model<PostAdoptionSurveyDocument>('postAdoptionSurvey');
const FosterProfileModel = mongoose.model<FosterProfileDocument>('fosterProfile');
const FosterPlacementModel = mongoose.model<FosterPlacementDocument>('fosterPlacement');
const FosterUpdateModel = mongoose.model<FosterUpdateDocument>('fosterUpdate');
const MessageThreadModel = mongoose.model<MessageThreadDocument>('messageThread');
const MessageTemplateModel = mongoose.model<MessageTemplateDocument>('messageTemplate');
const EmailPreferenceModel = mongoose.model<EmailPreferenceDocument>('emailPreference');
const EmailLogModel = mongoose.model<EmailLogDocument>('emailLog');
const PushSubscriptionModel = mongoose.model<PushSubscriptionDocument>('pushSubscription');
const NotificationPreferenceModel = mongoose.model<NotificationPreferenceDocument>('notificationPreference');
const ScheduledNotificationModel = mongoose.model<ScheduledNotificationDocument>('scheduledNotification');
const ShareEventModel = mongoose.model<ShareEventDocument>('shareEvent');
const AuthSessionModel = mongoose.model<AuthSessionDocument>('authSession');

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
    ...paginationQueryFields,
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
        if (!isMongoConnected()) {
          return mockAnimals;
        }
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
        size: { type: GraphQLString },
        energyLevel: { type: GraphQLString },
        goodWithKids: { type: GraphQLBoolean },
        goodWithDogs: { type: GraphQLBoolean },
        goodWithCats: { type: GraphQLBoolean },
        houseTrained: { type: GraphQLBoolean },
        minAge: { type: GraphQLInt },
        maxAge: { type: GraphQLInt },
        sortBy: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve(_, args: {
        type?: string; breed?: string; sex?: string; color?: string; name?: string;
        status?: string; size?: string; energyLevel?: string;
        goodWithKids?: boolean; goodWithDogs?: boolean; goodWithCats?: boolean;
        houseTrained?: boolean;
        minAge?: number; maxAge?: number; sortBy?: string; limit?: number; offset?: number;
      }) {
        // Return mock data if MongoDB is not connected
        if (!isMongoConnected()) {
          return filterMockAnimals(args);
        }
        const filter: Record<string, unknown> = {};
        if (args.type) filter.type = args.type;
        if (args.breed) filter.breed = { $regex: args.breed, $options: 'i' };
        if (args.sex) filter.sex = args.sex;
        if (args.status) filter.status = args.status;
        if (args.size) filter.size = args.size;
        if (args.energyLevel) filter.energyLevel = args.energyLevel;
        if (args.goodWithKids !== undefined) filter.goodWithKids = args.goodWithKids;
        if (args.goodWithDogs !== undefined) filter.goodWithDogs = args.goodWithDogs;
        if (args.goodWithCats !== undefined) filter.goodWithCats = args.goodWithCats;
        if (args.houseTrained !== undefined) filter.houseTrained = args.houseTrained;
        if (args.color) filter.color = { $regex: args.color, $options: 'i' };
        if (args.name) filter.name = { $regex: args.name, $options: 'i' };
        if (args.minAge !== undefined || args.maxAge !== undefined) {
          filter.age = {};
          if (args.minAge !== undefined) (filter.age as Record<string, number>).$gte = args.minAge;
          if (args.maxAge !== undefined) (filter.age as Record<string, number>).$lte = args.maxAge;
        }
        const sortOptions: Record<string, Record<string, 1 | -1>> = {
          newest: { _id: -1 },
          oldest: { _id: 1 },
          name_asc: { name: 1 },
          name_desc: { name: -1 },
          age_asc: { age: 1 },
          age_desc: { age: -1 },
        };
        const sort = sortOptions[args.sortBy ?? ''] ?? { _id: -1 };
        let query = Animal.find(filter).sort(sort);
        if (args.offset !== undefined) query = query.skip(args.offset);
        const limit = clampLimit(args.limit, DEFAULT_ANIMAL_LIMIT, MAX_ANIMAL_LIMIT);
        query = query.limit(limit);
        return query;
      }
    },
    findAnimalsCount: {
      type: GraphQLInt,
      args: {
        type: { type: GraphQLString },
        breed: { type: GraphQLString },
        sex: { type: GraphQLString },
        color: { type: GraphQLString },
        name: { type: GraphQLString },
        status: { type: GraphQLString },
        size: { type: GraphQLString },
        energyLevel: { type: GraphQLString },
        goodWithKids: { type: GraphQLBoolean },
        goodWithDogs: { type: GraphQLBoolean },
        goodWithCats: { type: GraphQLBoolean },
        houseTrained: { type: GraphQLBoolean },
        minAge: { type: GraphQLInt },
        maxAge: { type: GraphQLInt },
      },
      resolve(_, args: {
        type?: string; breed?: string; sex?: string; color?: string; name?: string;
        status?: string; size?: string; energyLevel?: string;
        goodWithKids?: boolean; goodWithDogs?: boolean; goodWithCats?: boolean;
        houseTrained?: boolean; minAge?: number; maxAge?: number;
      }) {
        const filter: Record<string, unknown> = {};
        if (args.type) filter.type = args.type;
        if (args.breed) filter.breed = { $regex: args.breed, $options: 'i' };
        if (args.sex) filter.sex = args.sex;
        if (args.status) filter.status = args.status;
        if (args.size) filter.size = args.size;
        if (args.energyLevel) filter.energyLevel = args.energyLevel;
        if (args.goodWithKids !== undefined) filter.goodWithKids = args.goodWithKids;
        if (args.goodWithDogs !== undefined) filter.goodWithDogs = args.goodWithDogs;
        if (args.goodWithCats !== undefined) filter.goodWithCats = args.goodWithCats;
        if (args.houseTrained !== undefined) filter.houseTrained = args.houseTrained;
        if (args.color) filter.color = { $regex: args.color, $options: 'i' };
        if (args.name) filter.name = { $regex: args.name, $options: 'i' };
        if (args.minAge !== undefined || args.maxAge !== undefined) {
          filter.age = {};
          if (args.minAge !== undefined) (filter.age as Record<string, number>).$gte = args.minAge;
          if (args.maxAge !== undefined) (filter.age as Record<string, number>).$lte = args.maxAge;
        }
        return Animal.countDocuments(filter);
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
    shelterStaff: {
      type: new GraphQLList(UserType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.users || shelter.users.length === 0) return [];
        return User.find({ _id: { $in: shelter.users } });
      }
    },
    shelterEvents: {
      type: new GraphQLList(EventType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return EventModel.find({ shelterId: args.shelterId }).sort({ date: 1 });
      }
    },
    shelterDonations: {
      type: new GraphQLList(DonationType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return DonationModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 }).limit(50);
      }
    },
    shelterFosters: {
      type: new GraphQLList(FosterType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return FosterModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    userSavedSearches: {
      type: new GraphQLList(SavedSearchType),
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { userId: string }) {
        return SavedSearchModel.find({ userId: args.userId }).sort({ createdAt: -1 });
      }
    },
    shelterApplicationTemplates: {
      type: new GraphQLList(ApplicationTemplateType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return ApplicationTemplateModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    shelterActivityLog: {
      type: new GraphQLList(ActivityLogType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt }
      },
      resolve(_, args: { shelterId: string; limit?: number }) {
        const limit = args.limit || 30;
        return ActivityLogModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 }).limit(limit);
      }
    },
    shelterTerminalReaders: {
      type: new GraphQLList(TerminalReaderType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(_, args: { shelterId: string }) {
        return TerminalReaderModel.find({ shelterId: args.shelterId }).sort({ registeredAt: -1 });
      }
    },
    conversationMessages: {
      type: new GraphQLList(MessageType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        shelterId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(_, args: { userId: string; shelterId: string }) {
        return MessageModel.find({
          shelterId: args.shelterId,
          $or: [
            { senderId: args.userId },
            { recipientId: args.userId }
          ]
        }).sort({ createdAt: 1 });
      }
    },
    shelterConversations: {
      type: new GraphQLList(MessageType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, args: { shelterId: string }) {
        const messages = await MessageModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
        const seen = new Set<string>();
        const latest: MessageDocument[] = [];
        for (const msg of messages) {
          const otherId = msg.senderId === args.shelterId ? msg.recipientId : msg.senderId;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            latest.push(msg);
          }
        }
        return latest;
      }
    },
    userConversations: {
      type: new GraphQLList(MessageType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, args: { userId: string }) {
        const messages = await MessageModel.find({
          $or: [
            { senderId: args.userId },
            { recipientId: args.userId }
          ]
        }).sort({ createdAt: -1 });
        const seen = new Set<string>();
        const latest: MessageDocument[] = [];
        for (const msg of messages) {
          if (!seen.has(msg.shelterId)) {
            seen.add(msg.shelterId);
            latest.push(msg);
          }
        }
        return latest;
      }
    },
    shelterVolunteers: {
      type: new GraphQLList(VolunteerType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(_, args: { shelterId: string }) {
        return VolunteerModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    platformStats: {
      type: PlatformStatsType,
      async resolve() {
        if (!isMongoConnected()) {
          return mockPlatformStats;
        }
        const [totalUsers, totalShelters, totalAnimals, totalApplications, availableAnimals, adoptedAnimals, totalDonations] = await Promise.all([
          User.countDocuments({}),
          Shelter.countDocuments({}),
          Animal.countDocuments({}),
          Application.countDocuments({}),
          Animal.countDocuments({ status: 'available' }),
          Animal.countDocuments({ status: 'adopted' }),
          DonationModel.countDocuments({})
        ]);
        return { totalUsers, totalShelters, totalAnimals, totalApplications, availableAnimals, adoptedAnimals, totalDonations };
      }
    },
    successStories: {
      type: new GraphQLList(SuccessStoryType),
      resolve() {
        if (!isMongoConnected()) {
          return mockSuccessStories;
        }
        return SuccessStoryModel.find({}).sort({ createdAt: -1 });
      }
    },
    userNotifications: {
      type: new GraphQLList(NotificationType),
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { userId: string }) {
        return NotificationModel.find({ userId: args.userId }).sort({ createdAt: -1 }).limit(50);
      }
    },
    shelterReviews: {
      type: new GraphQLList(ReviewType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return ReviewModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    similarAnimals: {
      type: new GraphQLList(AnimalType),
      args: {
        animalId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt }
      },
      async resolve(_, args: { animalId: string; limit?: number }) {
        const animal = await Animal.findById(args.animalId);
        if (!animal) return [];
        const limit = args.limit || 4;
        // Find animals of same type, excluding current, preferring same breed
        const sameBreed = await Animal.find({
          _id: { $ne: args.animalId },
          type: animal.type,
          breed: animal.breed,
          status: 'available'
        }).limit(limit);
        if (sameBreed.length >= limit) return sameBreed;
        // Fill remaining slots with same type
        const existingIds = sameBreed.map(a => a._id.toString());
        existingIds.push(args.animalId);
        const sameType = await Animal.find({
          _id: { $nin: existingIds },
          type: animal.type,
          status: 'available'
        }).limit(limit - sameBreed.length);
        return [...sameBreed, ...sameType];
      }
    },
    shelterAnalytics: {
      type: ShelterAnalyticsType,
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.animals || shelter.animals.length === 0) {
          return {
            totalAnimals: 0,
            availableAnimals: 0,
            pendingAnimals: 0,
            adoptedAnimals: 0,
            adoptionRate: 0,
            totalApplications: 0,
            submittedApplications: 0,
            underReviewApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
            recentApplications: 0
          };
        }

        const animalIds = shelter.animals.map((id) => id.toString());
        const animals = await Animal.find({ _id: { $in: animalIds } });

        const totalAnimals = animals.length;
        const availableAnimals = animals.filter((a) => a.status === 'available').length;
        const pendingAnimals = animals.filter((a) => a.status === 'pending').length;
        const adoptedAnimals = animals.filter((a) => a.status === 'adopted').length;
        const adoptionRate = totalAnimals > 0 ? (adoptedAnimals / totalAnimals) * 100 : 0;

        const applications = await Application.find({ animalId: { $in: animalIds } });

        const totalApplications = applications.length;
        const submittedApplications = applications.filter((a) => a.status === 'submitted').length;
        const underReviewApplications = applications.filter((a) => a.status === 'under_review').length;
        const approvedApplications = applications.filter((a) => a.status === 'approved').length;
        const rejectedApplications = applications.filter((a) => a.status === 'rejected').length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentApplications = applications.filter(
          (a) => a.submittedAt && new Date(a.submittedAt) >= thirtyDaysAgo
        ).length;

        return {
          totalAnimals,
          availableAnimals,
          pendingAnimals,
          adoptedAnimals,
          adoptionRate,
          totalApplications,
          submittedApplications,
          underReviewApplications,
          approvedApplications,
          rejectedApplications,
          recentApplications
        };
      }
    },
    shelterBehaviorNotes: {
      type: new GraphQLList(BehaviorNoteType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return BehaviorNoteModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    shelterAnnouncements: {
      type: new GraphQLList(AnnouncementType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return AnnouncementModel.find({ shelterId: args.shelterId, active: true }).sort({ pinned: -1, createdAt: -1 });
      }
    },
    shelterMicrochips: {
      type: new GraphQLList(MicrochipType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return MicrochipModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    animalWeightRecords: {
      type: new GraphQLList(WeightRecordType),
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { animalId: string }) {
        return WeightRecordModel.find({ animalId: args.animalId }).sort({ recordedAt: -1 });
      }
    },
    animalVaccinations: {
      type: new GraphQLList(VaccinationType),
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { animalId: string }) {
        return VaccinationModel.find({ animalId: args.animalId }).sort({ dateAdministered: -1 });
      }
    },
    shelterAdoptionFees: {
      type: new GraphQLList(AdoptionFeeType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return AdoptionFeeModel.find({ shelterId: args.shelterId, active: true });
      }
    },
    animalSpayNeuter: {
      type: SpayNeuterType,
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { animalId: string }) {
        return SpayNeuterModel.findOne({ animalId: args.animalId });
      }
    },
    animalIntakeLogs: {
      type: new GraphQLList(IntakeLogType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return IntakeLogModel.find({ shelterId: args.shelterId }).sort({ intakeDate: -1 });
      }
    },
    animalOutcomeLogs: {
      type: new GraphQLList(OutcomeLogType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return OutcomeLogModel.find({ shelterId: args.shelterId }).sort({ outcomeDate: -1 });
      }
    },
    animalTimeline: {
      type: new GraphQLList(AnimalTimelineEntryType),
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { animalId: string }) {
        const entries: Array<{ _id: string; eventType: string; date: string; title: string; description: string; author: string }> = [];

        const [intakeLogs, outcomeLogs, behaviorNotes, weightRecords, vaccinations, spayNeuter] = await Promise.all([
          IntakeLogModel.find({ animalId: args.animalId }),
          OutcomeLogModel.find({ animalId: args.animalId }),
          BehaviorNoteModel.find({ animalId: args.animalId }),
          WeightRecordModel.find({ animalId: args.animalId }),
          VaccinationModel.find({ animalId: args.animalId }),
          SpayNeuterModel.findOne({ animalId: args.animalId }),
        ]);

        for (const log of intakeLogs) {
          entries.push({
            _id: log._id.toString(),
            eventType: 'intake',
            date: log.intakeDate?.toISOString() ?? log.createdAt?.toISOString() ?? '',
            title: `Intake: ${log.intakeType}`,
            description: [log.source, log.condition, log.intakeNotes].filter(Boolean).join(' - '),
            author: log.receivedBy ?? '',
          });
        }

        for (const log of outcomeLogs) {
          entries.push({
            _id: log._id.toString(),
            eventType: 'outcome',
            date: log.outcomeDate?.toISOString() ?? log.createdAt?.toISOString() ?? '',
            title: `Outcome: ${log.outcomeType}`,
            description: [log.destination, log.outcomeNotes].filter(Boolean).join(' - '),
            author: log.processedBy ?? '',
          });
        }

        for (const note of behaviorNotes) {
          entries.push({
            _id: note._id.toString(),
            eventType: 'behavior',
            date: note.createdAt?.toISOString() ?? '',
            title: `Behavior: ${note.noteType} (${note.severity})`,
            description: note.content ?? '',
            author: note.author ?? '',
          });
        }

        for (const record of weightRecords) {
          entries.push({
            _id: record._id.toString(),
            eventType: 'weight',
            date: record.recordedAt?.toISOString() ?? '',
            title: `Weight: ${record.weight} ${record.unit}`,
            description: record.notes ?? '',
            author: record.recordedBy ?? '',
          });
        }

        for (const vax of vaccinations) {
          entries.push({
            _id: vax._id.toString(),
            eventType: 'vaccination',
            date: vax.administeredDate?.toISOString() ?? vax.createdAt?.toISOString() ?? '',
            title: `Vaccination: ${vax.vaccineName}`,
            description: vax.notes ?? '',
            author: vax.administeredBy ?? '',
          });
        }

        if (spayNeuter) {
          const dateStr = spayNeuter.completedDate?.toISOString()
            ?? spayNeuter.scheduledDate?.toISOString()
            ?? spayNeuter.createdAt?.toISOString()
            ?? '';
          entries.push({
            _id: spayNeuter._id.toString(),
            eventType: 'spay_neuter',
            date: dateStr,
            title: `Spay/Neuter: ${spayNeuter.status}`,
            description: spayNeuter.notes ?? '',
            author: spayNeuter.veterinarian ?? '',
          });
        }

        // Also include medical records from the animal itself
        const animal = await Animal.findById(args.animalId);
        if (animal?.medicalRecords) {
          for (const record of animal.medicalRecords) {
            entries.push({
              _id: record._id?.toString() ?? '',
              eventType: 'medical',
              date: record.date ?? '',
              title: `Medical: ${record.recordType}`,
              description: record.description ?? '',
              author: record.veterinarian ?? '',
            });
          }
        }

        // Sort by date descending (newest first)
        entries.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });

        return entries;
      }
    },
    animalBehaviorNotes: {
      type: new GraphQLList(BehaviorNoteType),
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { animalId: string }) {
        return BehaviorNoteModel.find({ animalId: args.animalId }).sort({ createdAt: -1 });
      }
    },
    animalStatusHistory: {
      type: new GraphQLList(StatusHistoryType),
      args: {
        animalId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      resolve(_, args: { animalId: string; limit?: number }) {
        const limit = clampLimit(args.limit, 50, MAX_ANIMAL_LIMIT);
        return StatusHistoryModel.find({ animalId: args.animalId })
          .sort({ createdAt: -1 })
          .limit(limit);
      }
    },
    shelterStatusReport: {
      type: new GraphQLObjectType({
        name: 'ShelterStatusReportType',
        fields: () => ({
          available: { type: GraphQLInt },
          pending: { type: GraphQLInt },
          adopted: { type: GraphQLInt },
          hold: { type: GraphQLInt },
          fostered: { type: GraphQLInt },
          transferred: { type: GraphQLInt },
          deceased: { type: GraphQLInt },
          total: { type: GraphQLInt },
          averageLengthOfStay: { type: GraphQLFloat },
          longStayCount: { type: GraphQLInt },
        }),
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        longStayThresholdDays: { type: GraphQLInt },
      },
      async resolve(_, args: { shelterId: string; longStayThresholdDays?: number }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.animals || shelter.animals.length === 0) {
          return { available: 0, pending: 0, adopted: 0, hold: 0, fostered: 0, transferred: 0, deceased: 0, total: 0, averageLengthOfStay: 0, longStayCount: 0 };
        }
        const animalIds = shelter.animals.map(id => id.toString());
        const animals = await Animal.find({ _id: { $in: animalIds } });
        const counts: Record<string, number> = { available: 0, pending: 0, adopted: 0, hold: 0, fostered: 0, transferred: 0, deceased: 0 };
        const now = new Date();
        const threshold = args.longStayThresholdDays ?? 90;
        let totalDays = 0;
        let animalsWithIntake = 0;
        let longStayCount = 0;

        for (const animal of animals) {
          const status = animal.status ?? 'available';
          if (status in counts) counts[status]++;
          if (animal.intakeDate) {
            const days = Math.floor((now.getTime() - new Date(animal.intakeDate).getTime()) / (1000 * 60 * 60 * 24));
            totalDays += days;
            animalsWithIntake++;
            if (days >= threshold && status !== 'adopted' && status !== 'transferred' && status !== 'deceased') {
              longStayCount++;
            }
          }
        }

        return {
          ...counts,
          total: animals.length,
          averageLengthOfStay: animalsWithIntake > 0 ? Math.round((totalDays / animalsWithIntake) * 10) / 10 : 0,
          longStayCount,
        };
      }
    },
    breedAutocomplete: {
      type: new GraphQLList(GraphQLString),
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
        animalType: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_, args: { query: string; animalType?: string; limit?: number }) {
        const filter: Record<string, unknown> = {
          breed: { $regex: args.query, $options: 'i' },
        };
        if (args.animalType) filter.type = args.animalType;
        const limit = clampLimit(args.limit, 10, 50);
        const results = await Animal.distinct('breed', filter);
        return results
          .filter((b: string) => b && b.length > 0)
          .sort()
          .slice(0, limit);
      }
    },
    findNearbyShelters: {
      type: new GraphQLList(ShelterType),
      args: {
        latitude: { type: new GraphQLNonNull(GraphQLFloat) },
        longitude: { type: new GraphQLNonNull(GraphQLFloat) },
        radiusMiles: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve(_, args: { latitude: number; longitude: number; radiusMiles?: number; limit?: number }) {
        const radiusMeters = (args.radiusMiles ?? 50) * 1609.34;
        const limit = clampLimit(args.limit, 20, MAX_ANIMAL_LIMIT);
        return Shelter.find({
          coordinates: {
            $near: {
              $geometry: { type: 'Point', coordinates: [args.longitude, args.latitude] },
              $maxDistance: radiusMeters,
            },
          },
        }).limit(limit);
      }
    },
    shelterPendingApplications: {
      type: new GraphQLList(ApplicationType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      async resolve(_, args: { shelterId: string; limit?: number }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.animals || shelter.animals.length === 0) return [];
        const animalIds = shelter.animals.map(id => id.toString());
        const limit = clampLimit(args.limit, 20, MAX_ANIMAL_LIMIT);
        return Application.find({
          animalId: { $in: animalIds },
          status: 'submitted',
        }).sort({ submittedAt: 1 }).limit(limit);
      }
    },
    shelterRecentAdoptions: {
      type: new GraphQLList(AnimalType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        days: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      async resolve(_, args: { shelterId: string; days?: number; limit?: number }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.animals || shelter.animals.length === 0) return [];
        const animalIds = shelter.animals.map(id => id.toString());
        const limit = clampLimit(args.limit, 10, MAX_ANIMAL_LIMIT);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - (args.days ?? 30));

        // Find animals that were recently adopted via status history
        const StatusHistoryModelLocal = mongoose.model<StatusHistoryDocument>('statusHistory');
        const recentAdoptions = await StatusHistoryModelLocal.find({
          animalId: { $in: animalIds },
          toStatus: 'adopted',
          createdAt: { $gte: daysAgo },
        }).sort({ createdAt: -1 }).limit(limit);

        const adoptedIds = recentAdoptions.map(h => h.animalId);
        if (adoptedIds.length === 0) return [];
        return Animal.find({ _id: { $in: adoptedIds } });
      }
    },
    shelterDailyReport: {
      type: new GraphQLObjectType({
        name: 'ShelterDailyReportType',
        fields: () => ({
          date: { type: GraphQLString },
          totalAnimals: { type: GraphQLInt },
          available: { type: GraphQLInt },
          pending: { type: GraphQLInt },
          adopted: { type: GraphQLInt },
          intakesToday: { type: GraphQLInt },
          outcomesToday: { type: GraphQLInt },
          pendingApplications: { type: GraphQLInt },
          newApplicationsToday: { type: GraphQLInt },
        }),
      }),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) return null;
        const animalIds = shelter.animals?.map(id => id.toString()) ?? [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const animals = animalIds.length > 0 ? await Animal.find({ _id: { $in: animalIds } }) : [];
        const totalAnimals = animals.length;
        const available = animals.filter(a => a.status === 'available').length;
        const pending = animals.filter(a => a.status === 'pending').length;
        const adopted = animals.filter(a => a.status === 'adopted').length;

        const [intakesToday, outcomesToday, allApps, newAppsToday] = await Promise.all([
          IntakeLogModel.countDocuments({ shelterId: args.shelterId, intakeDate: { $gte: today } }),
          OutcomeLogModel.countDocuments({ shelterId: args.shelterId, outcomeDate: { $gte: today } }),
          animalIds.length > 0
            ? Application.countDocuments({ animalId: { $in: animalIds }, status: 'submitted' })
            : 0,
          animalIds.length > 0
            ? Application.countDocuments({ animalId: { $in: animalIds }, submittedAt: { $gte: today } })
            : 0,
        ]);

        return {
          date: new Date().toISOString().split('T')[0],
          totalAnimals,
          available,
          pending,
          adopted,
          intakesToday,
          outcomesToday,
          pendingApplications: allApps,
          newApplicationsToday: newAppsToday,
        };
      }
    },
    shelterStaffRoles: {
      type: new GraphQLList(ShelterStaffRoleType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return ShelterStaffRoleModel.find({ shelterId: args.shelterId }).sort({ createdAt: 1 });
      }
    },
    shelterInvitations: {
      type: new GraphQLList(StaffInvitationType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: GraphQLString },
      },
      resolve(_, args: { shelterId: string; status?: string }) {
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.status) filter.status = args.status;
        return StaffInvitationModel.find(filter).sort({ createdAt: -1 });
      }
    },
    internalNotes: {
      type: new GraphQLList(InternalNoteType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        entityType: { type: GraphQLString },
        entityId: { type: GraphQLString },
      },
      resolve(_, args: { shelterId: string; entityType?: string; entityId?: string }) {
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.entityType) filter.entityType = args.entityType;
        if (args.entityId) filter.entityId = args.entityId;
        return InternalNoteModel.find(filter).sort({ createdAt: -1 });
      }
    },
    staffAssignedAnimals: {
      type: new GraphQLList(GraphQLString),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_, args: { shelterId: string; userId: string }) {
        const staffRole = await ShelterStaffRoleModel.findOne({ shelterId: args.shelterId, userId: args.userId });
        return staffRole?.assignedAnimals ?? [];
      }
    },
    dashboardLayout: {
      type: DashboardLayoutType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(_, args: { userId: string; shelterId: string }) {
        return DashboardLayoutModel.findOne({ userId: args.userId, shelterId: args.shelterId });
      }
    },
    animalMedia: {
      type: new GraphQLList(MediaAssetType),
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { animalId: string }) {
        return MediaAssetModel.find({ animalId: args.animalId }).sort({ sortOrder: 1 });
      }
    },
    animalMediaStats: {
      type: new GraphQLObjectType({
        name: 'AnimalMediaStatsType',
        fields: () => ({
          totalAssets: { type: GraphQLInt },
          totalViews: { type: GraphQLInt },
          mostViewedUrl: { type: GraphQLString },
        }),
      }),
      args: { animalId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { animalId: string }) {
        const assets = await MediaAssetModel.find({ animalId: args.animalId }).sort({ viewCount: -1 });
        const totalAssets = assets.length;
        const totalViews = assets.reduce((sum, a) => sum + (a.viewCount || 0), 0);
        const mostViewedUrl = assets.length > 0 ? assets[0].url : null;
        return { totalAssets, totalViews, mostViewedUrl };
      }
    },
    shelterKennels: {
      type: new GraphQLList(KennelAssignmentType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: GraphQLString },
      },
      resolve(_, args: { shelterId: string; status?: string }) {
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.status) filter.status = args.status;
        return KennelAssignmentModel.find(filter).sort({ kennelId: 1 });
      }
    },
    shelterCapacity: {
      type: new GraphQLObjectType({
        name: 'ShelterCapacityType',
        fields: () => ({
          maxCapacity: { type: GraphQLInt },
          currentOccupancy: { type: GraphQLInt },
          availableKennels: { type: GraphQLInt },
          maintenanceKennels: { type: GraphQLInt },
          occupancyPercent: { type: GraphQLFloat },
          atWarningThreshold: { type: GraphQLBoolean },
          atCriticalThreshold: { type: GraphQLBoolean },
        }),
      }),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter) return null;

        const [occupied, maintenance, vacant] = await Promise.all([
          KennelAssignmentModel.countDocuments({ shelterId: args.shelterId, status: 'occupied' }),
          KennelAssignmentModel.countDocuments({ shelterId: args.shelterId, status: 'maintenance' }),
          KennelAssignmentModel.countDocuments({ shelterId: args.shelterId, status: 'vacant' }),
        ]);

        const maxCapacity = shelter.maxCapacity || 0;
        const occupancyPercent = maxCapacity > 0 ? Math.round((occupied / maxCapacity) * 1000) / 10 : 0;

        return {
          maxCapacity,
          currentOccupancy: occupied,
          availableKennels: vacant,
          maintenanceKennels: maintenance,
          occupancyPercent,
          atWarningThreshold: maxCapacity > 0 && occupancyPercent >= 80,
          atCriticalThreshold: maxCapacity > 0 && occupancyPercent >= 95,
        };
      }
    },
    intakeSourceAnalytics: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'IntakeSourceAnalyticsType',
        fields: () => ({
          source: { type: GraphQLString },
          count: { type: GraphQLInt },
          percentage: { type: GraphQLFloat },
        }),
      })),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_, args: { shelterId: string; startDate?: string; endDate?: string }) {
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.startDate || args.endDate) {
          filter.intakeDate = {};
          if (args.startDate) (filter.intakeDate as Record<string, Date>).$gte = new Date(args.startDate);
          if (args.endDate) (filter.intakeDate as Record<string, Date>).$lte = new Date(args.endDate);
        }

        const logs = await IntakeLogModel.find(filter);
        const sourceCounts: Record<string, number> = {};
        for (const log of logs) {
          const source = log.source || 'unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        }

        const total = logs.length;
        return Object.entries(sourceCounts)
          .map(([source, count]) => ({
            source,
            count,
            percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
          }))
          .sort((a, b) => b.count - a.count);
      }
    },
    adoptionRecord: {
      type: AdoptionRecordType,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { _id: string }) {
        return AdoptionRecordModel.findById(args._id);
      }
    },
    shelterAdoptionRecords: {
      type: new GraphQLList(AdoptionRecordType),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      resolve(_, args: { shelterId: string; limit?: number }) {
        const limit = clampLimit(args.limit, 50, MAX_ANIMAL_LIMIT);
        return AdoptionRecordModel.find({ shelterId: args.shelterId }).sort({ adoptionDate: -1 }).limit(limit);
      }
    },
    userAdoptionRecords: {
      type: new GraphQLList(AdoptionRecordType),
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { userId: string }) {
        return AdoptionRecordModel.find({ adopterId: args.userId }).sort({ adoptionDate: -1 });
      }
    },
    pendingFollowUps: {
      type: new GraphQLList(AdoptionRecordType),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return AdoptionRecordModel.find({
          shelterId: args.shelterId,
          'followUps.status': 'pending',
          'followUps.scheduledDate': { $lte: new Date() },
        }).sort({ 'followUps.scheduledDate': 1 });
      }
    },
    adoptionAnalytics: {
      type: new GraphQLObjectType({
        name: 'AdoptionAnalyticsType',
        fields: () => ({
          totalAdoptions: { type: GraphQLInt },
          averageTimeToAdopt: { type: GraphQLFloat },
          returnRate: { type: GraphQLFloat },
          totalFees: { type: GraphQLFloat },
          averageSatisfaction: { type: GraphQLFloat },
        }),
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        days: { type: GraphQLInt },
      },
      async resolve(_, args: { shelterId: string; days?: number }) {
        const dateFilter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.days) {
          const since = new Date();
          since.setDate(since.getDate() - args.days);
          dateFilter.adoptionDate = { $gte: since };
        }

        const records = await AdoptionRecordModel.find(dateFilter);
        const totalAdoptions = records.length;
        const returns = records.filter(r => r.returnDate).length;
        const returnRate = totalAdoptions > 0 ? Math.round((returns / totalAdoptions) * 1000) / 10 : 0;
        const totalFees = records.reduce((sum, r) => sum + (r.feeAmount || 0), 0);

        // Average time from application to adoption
        let totalDays = 0;
        let withApps = 0;
        for (const record of records) {
          if (record.applicationId) {
            const app = await Application.findById(record.applicationId);
            if (app?.submittedAt) {
              const days = (record.adoptionDate.getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
              totalDays += days;
              withApps++;
            }
          }
        }
        const averageTimeToAdopt = withApps > 0 ? Math.round((totalDays / withApps) * 10) / 10 : 0;

        // Average satisfaction from surveys
        const recordIds = records.map(r => r._id.toString());
        const surveys = await PostAdoptionSurveyModel.find({ adoptionRecordId: { $in: recordIds } });
        const totalSat = surveys.reduce((sum, s) => sum + (s.overallSatisfaction || 0), 0);
        const averageSatisfaction = surveys.length > 0 ? Math.round((totalSat / surveys.length) * 10) / 10 : 0;

        return { totalAdoptions, averageTimeToAdopt, returnRate, totalFees, averageSatisfaction };
      }
    },
    adopterProfile: {
      type: AdopterProfileType,
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { userId: string }) {
        return AdopterProfileModel.findOne({ userId: args.userId });
      }
    },
    recommendedAnimals: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'AnimalMatchType',
        fields: () => ({
          animal: { type: AnimalType },
          score: { type: GraphQLInt },
          factors: { type: GraphQLString },
        }),
      })),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      async resolve(_, args: { userId: string; limit?: number }) {
        const profile = await AdopterProfileModel.findOne({ userId: args.userId });
        if (!profile) return [];

        const limit = clampLimit(args.limit, 5, 20);
        const filter: Record<string, unknown> = { status: 'available' };
        if (profile.preferredSpecies.length > 0) {
          filter.type = { $in: profile.preferredSpecies };
        }

        const animals = await Animal.find(filter).limit(200);
        const scored = animals.map(animal => {
          const result = calculateMatchScore(profile, {
            _id: animal._id.toString(),
            type: animal.type,
            size: animal.size,
            energyLevel: animal.energyLevel,
            age: animal.age,
            goodWithKids: animal.goodWithKids,
            goodWithDogs: animal.goodWithDogs,
            goodWithCats: animal.goodWithCats,
            houseTrained: animal.houseTrained,
            specialNeeds: animal.specialNeeds,
          });
          return { animal, score: result.score, factors: JSON.stringify(result.factors) };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
      }
    },
    animalCompatibleApplicants: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'ApplicantMatchType',
        fields: () => ({
          userId: { type: GraphQLString },
          score: { type: GraphQLInt },
          factors: { type: GraphQLString },
        }),
      })),
      args: {
        animalId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      async resolve(_, args: { animalId: string; limit?: number }) {
        const animal = await Animal.findById(args.animalId);
        if (!animal) return [];

        const limit = clampLimit(args.limit, 10, 50);
        const profiles = await AdopterProfileModel.find({}).limit(500);
        const animalData = {
          _id: animal._id.toString(),
          type: animal.type,
          size: animal.size,
          energyLevel: animal.energyLevel,
          age: animal.age,
          goodWithKids: animal.goodWithKids,
          goodWithDogs: animal.goodWithDogs,
          goodWithCats: animal.goodWithCats,
          houseTrained: animal.houseTrained,
          specialNeeds: animal.specialNeeds,
        };

        const scored = profiles.map(profile => {
          const result = calculateMatchScore(profile, animalData);
          return { userId: profile.userId, score: result.score, factors: JSON.stringify(result.factors) };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
      }
    },
    userMatchHistory: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'MatchRecordType',
        fields: () => ({
          _id: { type: GraphQLID },
          userId: { type: GraphQLString },
          animalId: { type: GraphQLString },
          score: { type: GraphQLInt },
          outcome: { type: GraphQLString },
          createdAt: { type: GraphQLString },
        }),
      })),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      resolve(_, args: { userId: string; limit?: number }) {
        const limit = clampLimit(args.limit, 50, MAX_ANIMAL_LIMIT);
        return MatchRecordModel.find({ userId: args.userId }).sort({ createdAt: -1 }).limit(limit);
      }
    },
    applicationReviews: {
      type: new GraphQLList(ApplicationReviewType),
      args: { applicationId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { applicationId: string }) {
        return ApplicationReviewModel.find({ applicationId: args.applicationId }).sort({ createdAt: -1 });
      }
    },
    applicationReviewSummary: {
      type: new GraphQLObjectType({
        name: 'ApplicationReviewSummaryType',
        fields: () => ({
          applicationId: { type: GraphQLString },
          reviewCount: { type: GraphQLInt },
          averageScore: { type: GraphQLFloat },
          approveCount: { type: GraphQLInt },
          rejectCount: { type: GraphQLInt },
          needsInfoCount: { type: GraphQLInt },
          consensusReached: { type: GraphQLBoolean },
          consensusResult: { type: GraphQLString },
        }),
      }),
      args: {
        applicationId: { type: new GraphQLNonNull(GraphQLID) },
        requiredReviews: { type: GraphQLInt },
      },
      async resolve(_, args: { applicationId: string; requiredReviews?: number }) {
        const reviews = await ApplicationReviewModel.find({ applicationId: args.applicationId });
        const required = args.requiredReviews ?? 2;
        const reviewCount = reviews.length;
        const totalScore = reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0);
        const averageScore = reviewCount > 0 ? Math.round((totalScore / reviewCount) * 10) / 10 : 0;

        const approveCount = reviews.filter(r => r.recommendation === 'approve').length;
        const rejectCount = reviews.filter(r => r.recommendation === 'reject').length;
        const needsInfoCount = reviews.filter(r => r.recommendation === 'needs_info').length;

        let consensusReached = false;
        let consensusResult = 'pending';
        if (reviewCount >= required) {
          if (approveCount > reviewCount / 2) {
            consensusReached = true;
            consensusResult = 'approve';
          } else if (rejectCount > reviewCount / 2) {
            consensusReached = true;
            consensusResult = 'reject';
          }
        }

        return {
          applicationId: args.applicationId,
          reviewCount,
          averageScore,
          approveCount,
          rejectCount,
          needsInfoCount,
          consensusReached,
          consensusResult,
        };
      }
    },
    shelterReviewAnalytics: {
      type: new GraphQLObjectType({
        name: 'ShelterReviewAnalyticsType',
        fields: () => ({
          totalReviewed: { type: GraphQLInt },
          averageReviewTime: { type: GraphQLFloat },
          approvalRate: { type: GraphQLFloat },
          rejectionRate: { type: GraphQLFloat },
          averageScore: { type: GraphQLFloat },
        }),
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        days: { type: GraphQLInt },
      },
      async resolve(_, args: { shelterId: string; days?: number }) {
        const shelter = await Shelter.findById(args.shelterId);
        if (!shelter || !shelter.animals || shelter.animals.length === 0) {
          return { totalReviewed: 0, averageReviewTime: 0, approvalRate: 0, rejectionRate: 0, averageScore: 0 };
        }
        const animalIds = shelter.animals.map(id => id.toString());

        const dateFilter: Record<string, unknown> = {};
        if (args.days) {
          const since = new Date();
          since.setDate(since.getDate() - args.days);
          dateFilter.submittedAt = { $gte: since };
        }

        const apps = await Application.find({
          animalId: { $in: animalIds },
          isDraft: { $ne: true },
          ...dateFilter,
        });

        const reviewed = apps.filter(a => a.status === 'approved' || a.status === 'rejected');
        const totalReviewed = reviewed.length;
        const approved = reviewed.filter(a => a.status === 'approved').length;
        const rejected = reviewed.filter(a => a.status === 'rejected').length;

        // Average review time: time from submittedAt to reviewedAt
        let totalReviewMs = 0;
        let reviewedWithTime = 0;
        for (const app of reviewed) {
          if (app.reviewedAt && app.submittedAt) {
            totalReviewMs += new Date(app.reviewedAt).getTime() - new Date(app.submittedAt).getTime();
            reviewedWithTime++;
          }
        }
        const avgReviewDays = reviewedWithTime > 0
          ? Math.round((totalReviewMs / reviewedWithTime / (1000 * 60 * 60 * 24)) * 10) / 10
          : 0;

        // Average score from reviews
        const appIds = apps.map(a => a._id.toString());
        const reviews = await ApplicationReviewModel.find({ applicationId: { $in: appIds } });
        const totalScore = reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0);
        const avgScore = reviews.length > 0 ? Math.round((totalScore / reviews.length) * 10) / 10 : 0;

        return {
          totalReviewed,
          averageReviewTime: avgReviewDays,
          approvalRate: totalReviewed > 0 ? Math.round((approved / totalReviewed) * 1000) / 10 : 0,
          rejectionRate: totalReviewed > 0 ? Math.round((rejected / totalReviewed) * 1000) / 10 : 0,
          averageScore: avgScore,
        };
      }
    },
    shelterRejectionTemplates: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'RejectionTemplateType',
        fields: () => ({
          _id: { type: GraphQLID },
          shelterId: { type: GraphQLString },
          name: { type: GraphQLString },
          subject: { type: GraphQLString },
          body: { type: GraphQLString },
          createdAt: { type: GraphQLString },
        }),
      })),
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { shelterId: string }) {
        return RejectionTemplateModel.find({ shelterId: args.shelterId }).sort({ createdAt: -1 });
      }
    },
    userApplicationDrafts: {
      type: new GraphQLList(ApplicationType),
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args: { userId: string }) {
        return Application.find({ userId: args.userId, isDraft: true }).sort({ submittedAt: -1 });
      }
    },
    userApplicationHistory: {
      type: new GraphQLList(ApplicationType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      resolve(_, args: { userId: string; status?: string; limit?: number }) {
        const filter: Record<string, unknown> = { userId: args.userId, isDraft: { $ne: true } };
        if (args.status) filter.status = args.status;
        const limit = clampLimit(args.limit, 50, MAX_ANIMAL_LIMIT);
        return Application.find(filter).sort({ submittedAt: -1 }).limit(limit);
      }
    },
    applicationTemplateForAnimal: {
      type: require('./application_template_type').default,
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        animalType: { type: GraphQLString },
      },
      async resolve(_, args: { shelterId: string; animalType?: string }) {
        // First try to find a template matching the animal type
        if (args.animalType) {
          const typeMatch = await ApplicationTemplateModel.findOne({
            shelterId: args.shelterId,
            animalType: args.animalType,
            active: true,
          });
          if (typeMatch) return typeMatch;
        }
        // Fall back to a generic template (empty animalType)
        return ApplicationTemplateModel.findOne({
          shelterId: args.shelterId,
          animalType: { $in: ['', null] },
          active: true,
        });
      }
    },
    shelterSettings: {
      type: ShelterSettingsType,
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        let settings = await ShelterSettingsModel.findOne({ shelterId: args.shelterId });
        if (!settings) {
          settings = new ShelterSettingsModel({ shelterId: args.shelterId });
          await settings.save();
        }
        return settings;
      }
    },
    exportShelterData: {
      type: GraphQLString,
      args: { shelterId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args: { shelterId: string }) {
        const [shelter, settings, animals, applications] = await Promise.all([
          Shelter.findById(args.shelterId),
          ShelterSettingsModel.findOne({ shelterId: args.shelterId }),
          Shelter.findById(args.shelterId).then(s => {
            if (!s || !s.animals || s.animals.length === 0) return [];
            return Animal.find({ _id: { $in: s.animals } });
          }),
          Shelter.findById(args.shelterId).then(s => {
            if (!s || !s.animals || s.animals.length === 0) return [];
            const ids = s.animals.map(id => id.toString());
            return Application.find({ animalId: { $in: ids } });
          }),
        ]);

        const exportData = {
          exportedAt: new Date().toISOString(),
          shelter: shelter?.toObject() ?? null,
          settings: settings?.toObject() ?? null,
          animalCount: animals.length,
          applicationCount: applications.length,
        };
        return JSON.stringify(exportData);
      }
    },
    findNearbyAnimals: {
      type: new GraphQLList(AnimalType),
      args: {
        latitude: { type: new GraphQLNonNull(GraphQLFloat) },
        longitude: { type: new GraphQLNonNull(GraphQLFloat) },
        radiusMiles: { type: GraphQLInt },
        status: { type: GraphQLString },
        type: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_, args: {
        latitude: number; longitude: number; radiusMiles?: number;
        status?: string; type?: string; limit?: number;
      }) {
        const radiusMeters = (args.radiusMiles ?? 50) * 1609.34;
        const limit = clampLimit(args.limit, DEFAULT_ANIMAL_LIMIT, MAX_ANIMAL_LIMIT);
        const shelters = await Shelter.find({
          coordinates: {
            $near: {
              $geometry: { type: 'Point', coordinates: [args.longitude, args.latitude] },
              $maxDistance: radiusMeters,
            },
          },
        });
        const animalIds = shelters.flatMap(s => s.animals.map(id => id.toString()));
        if (animalIds.length === 0) return [];
        const filter: Record<string, unknown> = { _id: { $in: animalIds } };
        if (args.status) filter.status = args.status;
        if (args.type) filter.type = args.type;
        return Animal.find(filter).limit(limit);
      }
    },

    // F5.1 - Foster Registration
    fosterProfile: {
      type: FosterProfileType,
      args: { userId: { type: GraphQLString }, shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.userId) filter.userId = args.userId;
        if (args.shelterId) filter.shelterId = args.shelterId;
        return FosterProfileModel.findOne(filter);
      },
    },
    shelterFosterDirectory: {
      type: new GraphQLList(FosterProfileType),
      args: {
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
        animalType: { type: GraphQLString },
        search: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.status) filter.status = args.status;
        if (args.animalType) {
          filter.acceptedAnimalTypes = args.animalType;
        }
        let profiles = FosterProfileModel.find(filter).sort({ createdAt: -1 });
        const results = await profiles;
        if (!args.search) return results;
        const term = args.search.toLowerCase();
        const UserModel = mongoose.model<UserDocument>('user');
        const userIds = results.map(p => p.userId);
        const users = await UserModel.find({ _id: { $in: userIds } });
        const userMap = new Map(users.map(u => [u._id.toString(), u]));
        return results.filter(p => {
          const user = userMap.get(p.userId);
          if (!user) return false;
          return user.name.toLowerCase().includes(term)
            || p.bio.toLowerCase().includes(term)
            || p.specialSkills.some(s => s.toLowerCase().includes(term));
        });
      },
    },
    fosterOrientationStatus: {
      type: new GraphQLObjectType({
        name: 'FosterOrientationStatusType',
        fields: {
          totalModules: { type: GraphQLInt },
          completedModules: { type: GraphQLInt },
          requiredModules: { type: GraphQLInt },
          requiredCompleted: { type: GraphQLInt },
          isComplete: { type: GraphQLBoolean },
        },
      }),
      args: { userId: { type: GraphQLString }, shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.userId || !args.shelterId) return null;
        const profile = await FosterProfileModel.findOne({
          userId: args.userId,
          shelterId: args.shelterId,
        });
        if (!profile) return null;
        const total = profile.orientation.length;
        const completed = profile.orientation.filter(o => o.completedAt).length;
        const required = profile.orientation.filter(o => o.required);
        const requiredCompleted = required.filter(o => o.completedAt).length;
        return {
          totalModules: total,
          completedModules: completed,
          requiredModules: required.length,
          requiredCompleted,
          isComplete: requiredCompleted >= required.length,
        };
      },
    },

    // F5.2 - Foster Matching
    matchedFostersForAnimal: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'FosterMatchResultType',
        fields: {
          fosterProfileId: { type: GraphQLString },
          userId: { type: GraphQLString },
          score: { type: GraphQLInt },
          factors: {
            type: new GraphQLList(new GraphQLObjectType({
              name: 'FosterMatchFactorType',
              fields: {
                key: { type: GraphQLString },
                value: { type: GraphQLFloat },
              },
            })),
          },
        },
      })),
      args: { animalId: { type: GraphQLString }, shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.animalId || !args.shelterId) return [];
        const animal = await Animal.findById(args.animalId);
        if (!animal) return [];
        const profiles = await FosterProfileModel.find({
          shelterId: args.shelterId,
          status: 'active',
        });
        const available = profiles.filter(p => isAvailable(p));
        const results = available
          .map(p => {
            const match = calculateFosterMatchScore(p, animal);
            return {
              ...match,
              factors: Object.entries(match.factors).map(([key, value]) => ({ key, value })),
            };
          })
          .sort((a, b) => b.score - a.score);
        return results;
      },
    },
    fosterAvailabilityCalendar: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'FosterAvailabilityEntryType',
        fields: {
          fosterProfileId: { type: GraphQLString },
          userId: { type: GraphQLString },
          isAvailable: { type: GraphQLBoolean },
          currentAnimalCount: { type: GraphQLInt },
          maxAnimals: { type: GraphQLInt },
          blackoutDates: {
            type: new GraphQLList(new GraphQLObjectType({
              name: 'BlackoutDateEntryType',
              fields: {
                start: { type: GraphQLString },
                end: { type: GraphQLString },
                reason: { type: GraphQLString },
              },
            })),
          },
        },
      })),
      args: { shelterId: { type: GraphQLString }, date: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const profiles = await FosterProfileModel.find({
          shelterId: args.shelterId,
          status: 'active',
        });
        const checkDate = args.date ? new Date(args.date) : new Date();
        return profiles.map(p => ({
          fosterProfileId: p._id.toString(),
          userId: p.userId,
          isAvailable: isAvailable(p, checkDate),
          currentAnimalCount: p.currentAnimalCount,
          maxAnimals: p.maxAnimals,
          blackoutDates: p.blackoutDates.map(bd => ({
            start: bd.start.toISOString(),
            end: bd.end.toISOString(),
            reason: bd.reason,
          })),
        }));
      },
    },
    fosterPlacementHistory: {
      type: new GraphQLList(FosterPlacementType),
      args: {
        fosterProfileId: { type: GraphQLString },
        userId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.fosterProfileId) filter.fosterProfileId = args.fosterProfileId;
        if (args.userId) filter.userId = args.userId;
        if (args.shelterId) filter.shelterId = args.shelterId;
        if (args.status) filter.status = args.status;
        return FosterPlacementModel.find(filter).sort({ createdAt: -1 });
      },
    },
    fosterPlacementAnalytics: {
      type: new GraphQLObjectType({
        name: 'FosterPlacementAnalyticsType',
        fields: {
          totalPlacements: { type: GraphQLInt },
          activePlacements: { type: GraphQLInt },
          completedPlacements: { type: GraphQLInt },
          averageDurationDays: { type: GraphQLFloat },
          emergencyPlacements: { type: GraphQLInt },
          averageMatchScore: { type: GraphQLFloat },
          utilizationRate: { type: GraphQLFloat },
        },
      }),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const placements = await FosterPlacementModel.find({ shelterId: args.shelterId });
        const active = placements.filter(p => p.status === 'active');
        const completed = placements.filter(p => p.status === 'completed');
        const emergency = placements.filter(p => p.isEmergency);
        const durations = completed
          .filter(p => p.startDate && p.endDate)
          .map(p => (p.endDate!.getTime() - p.startDate!.getTime()) / (1000 * 60 * 60 * 24));
        const avgDuration = durations.length > 0
          ? durations.reduce((s, d) => s + d, 0) / durations.length
          : 0;
        const totalScore = placements.reduce((s, p) => s + p.matchScore, 0);
        const avgScore = placements.length > 0 ? totalScore / placements.length : 0;
        const profiles = await FosterProfileModel.find({
          shelterId: args.shelterId,
          status: 'active',
        });
        const totalCapacity = profiles.reduce((s, p) => s + p.maxAnimals, 0);
        const utilizationRate = totalCapacity > 0 ? active.length / totalCapacity : 0;
        return {
          totalPlacements: placements.length,
          activePlacements: active.length,
          completedPlacements: completed.length,
          averageDurationDays: Math.round(avgDuration * 10) / 10,
          emergencyPlacements: emergency.length,
          averageMatchScore: Math.round(avgScore * 10) / 10,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
        };
      },
    },

    // F5.3 - Foster Management
    fosterDashboard: {
      type: new GraphQLObjectType({
        name: 'FosterDashboardType',
        fields: {
          activePlacements: { type: new GraphQLList(FosterPlacementType) },
          recentUpdates: { type: new GraphQLList(FosterUpdateType) },
          pendingSupplyRequests: { type: GraphQLInt },
          pendingExpenses: { type: GraphQLInt },
          totalExpenses: { type: GraphQLFloat },
          milestones: { type: new GraphQLList(FosterUpdateType) },
        },
      }),
      args: { userId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.userId) return null;
        const profiles = await FosterProfileModel.find({ userId: args.userId });
        const profileIds = profiles.map(p => p._id.toString());
        const activePlacements = await FosterPlacementModel.find({
          fosterProfileId: { $in: profileIds },
          status: 'active',
        });
        const recentUpdates = await FosterUpdateModel.find({
          userId: args.userId,
        }).sort({ date: -1 }).limit(20);
        const pendingSupplies = await FosterUpdateModel.countDocuments({
          userId: args.userId,
          type: 'supply_request',
          supplyStatus: 'pending',
        });
        const pendingExpenses = await FosterUpdateModel.countDocuments({
          userId: args.userId,
          type: 'expense',
          expenseStatus: 'pending',
        });
        const expenseUpdates = await FosterUpdateModel.find({
          userId: args.userId,
          type: 'expense',
        });
        const totalExpenses = expenseUpdates.reduce((s, u) => s + u.expenseAmount, 0);
        const milestones = await FosterUpdateModel.find({
          userId: args.userId,
          type: 'milestone',
        }).sort({ date: -1 }).limit(10);
        return {
          activePlacements,
          recentUpdates,
          pendingSupplyRequests: pendingSupplies,
          pendingExpenses,
          totalExpenses,
          milestones,
        };
      },
    },
    fosterUpdatesForPlacement: {
      type: new GraphQLList(FosterUpdateType),
      args: {
        placementId: { type: GraphQLString },
        type: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        if (!args.placementId) return [];
        const filter: Record<string, unknown> = { placementId: args.placementId };
        if (args.type) filter.type = args.type;
        const limit = clampLimit(args.limit, 50, 100);
        return FosterUpdateModel.find(filter).sort({ date: -1 }).limit(limit);
      },
    },
    shelterSupplyRequests: {
      type: new GraphQLList(FosterUpdateType),
      args: {
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const filter: Record<string, unknown> = {
          shelterId: args.shelterId,
          type: 'supply_request',
        };
        if (args.status) filter.supplyStatus = args.status;
        return FosterUpdateModel.find(filter).sort({ createdAt: -1 });
      },
    },
    shelterFosterExpenses: {
      type: new GraphQLList(FosterUpdateType),
      args: {
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const filter: Record<string, unknown> = {
          shelterId: args.shelterId,
          type: 'expense',
        };
        if (args.status) filter.expenseStatus = args.status;
        return FosterUpdateModel.find(filter).sort({ createdAt: -1 });
      },
    },
    fosterPhotoUpdates: {
      type: new GraphQLList(FosterUpdateType),
      args: {
        animalId: { type: GraphQLString },
        visibleToAdopters: { type: GraphQLBoolean },
      },
      async resolve(_parent, args) {
        if (!args.animalId) return [];
        const filter: Record<string, unknown> = {
          animalId: args.animalId,
          type: 'photo',
        };
        if (args.visibleToAdopters !== undefined) {
          filter.visibleToAdopters = args.visibleToAdopters;
        }
        return FosterUpdateModel.find(filter).sort({ date: -1 });
      },
    },

    // F5.4 - Foster Analytics
    fosterProgramMetrics: {
      type: new GraphQLObjectType({
        name: 'FosterProgramMetricsType',
        fields: {
          activeFosters: { type: GraphQLInt },
          animalsInFoster: { type: GraphQLInt },
          avgPlacementDurationDays: { type: GraphQLFloat },
          totalPlacements: { type: GraphQLInt },
          fosterToAdoptConversions: { type: GraphQLInt },
          returnRate: { type: GraphQLFloat },
          totalExpenses: { type: GraphQLFloat },
          avgExpensePerPlacement: { type: GraphQLFloat },
        },
      }),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const profiles = await FosterProfileModel.find({
          shelterId: args.shelterId,
          status: 'active',
        });
        const placements = await FosterPlacementModel.find({ shelterId: args.shelterId });
        const active = placements.filter(p => p.status === 'active');
        const completed = placements.filter(p => p.status === 'completed');
        const durations = completed
          .filter(p => p.startDate && p.endDate)
          .map(p => (p.endDate!.getTime() - p.startDate!.getTime()) / (1000 * 60 * 60 * 24));
        const avgDuration = durations.length > 0
          ? durations.reduce((s, d) => s + d, 0) / durations.length : 0;
        const expenses = await FosterUpdateModel.find({
          shelterId: args.shelterId,
          type: 'expense',
        });
        const totalExpenses = expenses.reduce((s, e) => s + e.expenseAmount, 0);
        const cancelled = placements.filter(p => p.status === 'cancelled' && p.returnReason);
        const returnRate = placements.length > 0
          ? cancelled.length / placements.length : 0;
        const adoptApps = await Application.find({
          shelterId: args.shelterId,
          notes: { $regex: /foster-to-adopt/i },
        });
        return {
          activeFosters: profiles.length,
          animalsInFoster: active.length,
          avgPlacementDurationDays: Math.round(avgDuration * 10) / 10,
          totalPlacements: placements.length,
          fosterToAdoptConversions: adoptApps.length,
          returnRate: Math.round(returnRate * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          avgExpensePerPlacement: completed.length > 0
            ? Math.round((totalExpenses / completed.length) * 100) / 100 : 0,
        };
      },
    },
    fosterPerformanceScores: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'FosterPerformanceScoreType',
        fields: {
          fosterProfileId: { type: GraphQLString },
          userId: { type: GraphQLString },
          reliabilityScore: { type: GraphQLFloat },
          communicationScore: { type: GraphQLFloat },
          careQualityScore: { type: GraphQLFloat },
          overallScore: { type: GraphQLFloat },
          totalPlacements: { type: GraphQLInt },
          completedPlacements: { type: GraphQLInt },
        },
      })),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const profiles = await FosterProfileModel.find({
          shelterId: args.shelterId,
          status: 'active',
        });
        const results = [];
        for (const profile of profiles) {
          const pid = profile._id.toString();
          const placements = await FosterPlacementModel.find({ fosterProfileId: pid });
          const completed = placements.filter(p => p.status === 'completed').length;
          const cancelled = placements.filter(p => p.status === 'cancelled').length;
          const reliability = placements.length > 0
            ? ((completed) / placements.length) * 100 : 50;
          const updates = await FosterUpdateModel.find({ fosterProfileId: pid });
          const dailyUpdates = updates.filter(u => u.type === 'daily_status').length;
          const activeDays = placements.reduce((sum, p) => {
            if (!p.startDate) return sum;
            const end = p.endDate ?? new Date();
            return sum + (end.getTime() - p.startDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0);
          const communication = activeDays > 0
            ? Math.min(100, (dailyUpdates / Math.max(1, activeDays)) * 100) : 50;
          const milestones = updates.filter(u => u.type === 'milestone').length;
          const careQuality = Math.min(100, 50 + milestones * 10 - cancelled * 20);
          const overall = (reliability * 0.4) + (communication * 0.3) + (careQuality * 0.3);
          results.push({
            fosterProfileId: pid,
            userId: profile.userId,
            reliabilityScore: Math.round(reliability * 10) / 10,
            communicationScore: Math.round(communication * 10) / 10,
            careQualityScore: Math.round(Math.max(0, careQuality) * 10) / 10,
            overallScore: Math.round(overall * 10) / 10,
            totalPlacements: placements.length,
            completedPlacements: completed,
          });
        }
        return results.sort((a, b) => b.overallScore - a.overallScore);
      },
    },
    fosterRetentionAnalysis: {
      type: new GraphQLObjectType({
        name: 'FosterRetentionAnalysisType',
        fields: {
          totalRegistered: { type: GraphQLInt },
          currentlyActive: { type: GraphQLInt },
          onHold: { type: GraphQLInt },
          inactive: { type: GraphQLInt },
          churnRate: { type: GraphQLFloat },
          avgTenureDays: { type: GraphQLFloat },
          atRiskFosters: { type: new GraphQLList(GraphQLString) },
        },
      }),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const all = await FosterProfileModel.find({ shelterId: args.shelterId });
        const active = all.filter(p => p.status === 'active');
        const onHold = all.filter(p => p.status === 'on_hold');
        const inactive = all.filter(p => p.status === 'inactive');
        const churnRate = all.length > 0 ? inactive.length / all.length : 0;
        const now = new Date();
        const tenures = active.map(p =>
          (now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const avgTenure = tenures.length > 0
          ? tenures.reduce((s, t) => s + t, 0) / tenures.length : 0;
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const atRisk: string[] = [];
        for (const profile of active) {
          const recentUpdates = await FosterUpdateModel.countDocuments({
            fosterProfileId: profile._id.toString(),
            date: { $gte: thirtyDaysAgo },
          });
          if (recentUpdates === 0) {
            atRisk.push(profile._id.toString());
          }
        }
        return {
          totalRegistered: all.length,
          currentlyActive: active.length,
          onHold: onHold.length,
          inactive: inactive.length,
          churnRate: Math.round(churnRate * 100) / 100,
          avgTenureDays: Math.round(avgTenure * 10) / 10,
          atRiskFosters: atRisk,
        };
      },
    },
    fosterRecruitmentPipeline: {
      type: new GraphQLObjectType({
        name: 'FosterRecruitmentPipelineType',
        fields: {
          pendingApproval: { type: GraphQLInt },
          active: { type: GraphQLInt },
          onHold: { type: GraphQLInt },
          inactive: { type: GraphQLInt },
          conversionRate: { type: GraphQLFloat },
          avgTimeToActiveHours: { type: GraphQLFloat },
        },
      }),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const all = await FosterProfileModel.find({ shelterId: args.shelterId });
        const pending = all.filter(p => p.status === 'pending_approval');
        const active = all.filter(p => p.status === 'active');
        const onHold = all.filter(p => p.status === 'on_hold');
        const inactive = all.filter(p => p.status === 'inactive');
        const everActive = all.filter(p =>
          p.status === 'active' || p.status === 'on_hold' || p.totalAnimalsHelped > 0
        );
        const conversionRate = all.length > 0 ? everActive.length / all.length : 0;
        return {
          pendingApproval: pending.length,
          active: active.length,
          onHold: onHold.length,
          inactive: inactive.length,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgTimeToActiveHours: 0,
        };
      },
    },
    fosterAppreciationMetrics: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'FosterAppreciationMetricType',
        fields: {
          fosterProfileId: { type: GraphQLString },
          userId: { type: GraphQLString },
          totalAnimalsHelped: { type: GraphQLInt },
          yearsActive: { type: GraphQLFloat },
          totalMilestones: { type: GraphQLInt },
          currentStreak: { type: GraphQLInt },
        },
      })),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const profiles = await FosterProfileModel.find({
          shelterId: args.shelterId,
          status: { $in: ['active', 'on_hold'] },
        });
        const now = new Date();
        const results = [];
        for (const p of profiles) {
          const pid = p._id.toString();
          const milestones = await FosterUpdateModel.countDocuments({
            fosterProfileId: pid,
            type: 'milestone',
          });
          const yearsActive = (now.getTime() - p.createdAt.getTime())
            / (1000 * 60 * 60 * 24 * 365);
          const placements = await FosterPlacementModel.find({
            fosterProfileId: pid,
            status: 'completed',
          }).sort({ endDate: -1 });
          let streak = 0;
          for (const pl of placements) {
            if (pl.status === 'completed') streak++;
            else break;
          }
          results.push({
            fosterProfileId: pid,
            userId: p.userId,
            totalAnimalsHelped: p.totalAnimalsHelped,
            yearsActive: Math.round(yearsActive * 10) / 10,
            totalMilestones: milestones,
            currentStreak: streak,
          });
        }
        return results.sort((a, b) => b.totalAnimalsHelped - a.totalAnimalsHelped);
      },
    },

    // F6.1 - Messaging System
    messageThreads: {
      type: new GraphQLList(MessageThreadType),
      args: {
        userId: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.userId) filter.participants = args.userId;
        if (args.shelterId) filter.shelterId = args.shelterId;
        if (args.status) filter.status = args.status;
        return MessageThreadModel.find(filter).sort({ lastMessageAt: -1 });
      },
    },
    messageThread: {
      type: MessageThreadType,
      args: { threadId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.threadId) return null;
        return MessageThreadModel.findById(args.threadId);
      },
    },
    threadMessages: {
      type: new GraphQLList(MessageType),
      args: {
        threadId: { type: GraphQLString },
        limit: { type: GraphQLInt },
        before: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.threadId) return [];
        const filter: Record<string, unknown> = {
          threadId: args.threadId,
          archived: { $ne: true },
        };
        if (args.before) {
          filter.createdAt = { $lt: new Date(args.before) };
        }
        const limit = clampLimit(args.limit, 50, 100);
        return MessageModel.find(filter).sort({ createdAt: -1 }).limit(limit);
      },
    },
    searchMessages: {
      type: new GraphQLList(MessageType),
      args: {
        userId: { type: GraphQLString },
        query: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        if (!args.userId || !args.query) return [];
        const limit = clampLimit(args.limit, 20, 50);
        return MessageModel.find({
          $or: [{ senderId: args.userId }, { recipientId: args.userId }],
          content: { $regex: args.query, $options: 'i' },
        }).sort({ createdAt: -1 }).limit(limit);
      },
    },
    messageTemplates: {
      type: new GraphQLList(MessageTemplateType),
      args: {
        shelterId: { type: GraphQLString },
        category: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const filter: Record<string, unknown> = {
          shelterId: args.shelterId,
          isActive: true,
        };
        if (args.category) filter.category = args.category;
        return MessageTemplateModel.find(filter).sort({ usageCount: -1 });
      },
    },
    messagingAnalytics: {
      type: new GraphQLObjectType({
        name: 'MessagingAnalyticsType',
        fields: {
          totalConversations: { type: GraphQLInt },
          activeConversations: { type: GraphQLInt },
          totalMessages: { type: GraphQLInt },
          avgResponseTimeMinutes: { type: GraphQLFloat },
          unreadMessages: { type: GraphQLInt },
        },
      }),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const threads = await MessageThreadModel.find({ shelterId: args.shelterId });
        const active = threads.filter(t => t.status === 'active');
        const messages = await MessageModel.countDocuments({ shelterId: args.shelterId });
        const unread = await MessageModel.countDocuments({
          shelterId: args.shelterId,
          read: false,
        });
        return {
          totalConversations: threads.length,
          activeConversations: active.length,
          totalMessages: messages,
          avgResponseTimeMinutes: 0,
          unreadMessages: unread,
        };
      },
    },

    // F6.2 - Email Notifications
    emailPreferences: {
      type: EmailPreferenceType,
      args: { userId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.userId) return null;
        return EmailPreferenceModel.findOneAndUpdate(
          { userId: args.userId },
          { $setOnInsert: { userId: args.userId } },
          { upsert: true, new: true },
        );
      },
    },
    emailAnalytics: {
      type: new GraphQLObjectType({
        name: 'EmailAnalyticsType',
        fields: {
          totalSent: { type: GraphQLInt },
          delivered: { type: GraphQLInt },
          opened: { type: GraphQLInt },
          clicked: { type: GraphQLInt },
          bounced: { type: GraphQLInt },
          failed: { type: GraphQLInt },
          openRate: { type: GraphQLFloat },
          clickRate: { type: GraphQLFloat },
          bounceRate: { type: GraphQLFloat },
        },
      }),
      args: {
        shelterId: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.startDate || args.endDate) {
          const dateFilter: Record<string, Date> = {};
          if (args.startDate) dateFilter.$gte = new Date(args.startDate);
          if (args.endDate) dateFilter.$lte = new Date(args.endDate);
          filter.createdAt = dateFilter;
        }
        const logs = await EmailLogModel.find(filter);
        const sent = logs.filter(l => l.status !== 'queued').length;
        const delivered = logs.filter(l => ['delivered', 'opened', 'clicked'].includes(l.status)).length;
        const opened = logs.filter(l => ['opened', 'clicked'].includes(l.status)).length;
        const clicked = logs.filter(l => l.status === 'clicked').length;
        const bounced = logs.filter(l => l.status === 'bounced').length;
        const failed = logs.filter(l => l.status === 'failed').length;
        return {
          totalSent: sent,
          delivered,
          opened,
          clicked,
          bounced,
          failed,
          openRate: sent > 0 ? Math.round((opened / sent) * 10000) / 100 : 0,
          clickRate: sent > 0 ? Math.round((clicked / sent) * 10000) / 100 : 0,
          bounceRate: sent > 0 ? Math.round((bounced / sent) * 10000) / 100 : 0,
        };
      },
    },
    emailLogs: {
      type: new GraphQLList(EmailLogType),
      args: {
        shelterId: { type: GraphQLString },
        userId: { type: GraphQLString },
        category: { type: GraphQLString },
        status: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.shelterId) filter.shelterId = args.shelterId;
        if (args.userId) filter.userId = args.userId;
        if (args.category) filter.category = args.category;
        if (args.status) filter.status = args.status;
        const limit = clampLimit(args.limit, 50, 100);
        return EmailLogModel.find(filter).sort({ createdAt: -1 }).limit(limit);
      },
    },

    // F6.3 - Push Notifications
    notificationPreferences: {
      type: new GraphQLObjectType({
        name: 'NotificationPreferenceType',
        fields: {
          _id: { type: GraphQLID },
          userId: { type: GraphQLString },
          applications: { type: GraphQLBoolean },
          messages: { type: GraphQLBoolean },
          favorites: { type: GraphQLBoolean },
          events: { type: GraphQLBoolean },
          shelterAnnouncements: { type: GraphQLBoolean },
          animalStatusChanges: { type: GraphQLBoolean },
          fosterUpdates: { type: GraphQLBoolean },
          quietHoursEnabled: {
            type: GraphQLBoolean,
            resolve(parent: Record<string, unknown>) {
              const qh = parent.quietHours as Record<string, unknown> | undefined;
              return qh?.enabled ?? false;
            },
          },
          quietHoursStart: {
            type: GraphQLInt,
            resolve(parent: Record<string, unknown>) {
              const qh = parent.quietHours as Record<string, unknown> | undefined;
              return qh?.startHour ?? 22;
            },
          },
          quietHoursEnd: {
            type: GraphQLInt,
            resolve(parent: Record<string, unknown>) {
              const qh = parent.quietHours as Record<string, unknown> | undefined;
              return qh?.endHour ?? 7;
            },
          },
          quietHoursTimezone: {
            type: GraphQLString,
            resolve(parent: Record<string, unknown>) {
              const qh = parent.quietHours as Record<string, unknown> | undefined;
              return (qh?.timezone as string) ?? 'America/New_York';
            },
          },
        },
      }),
      args: { userId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.userId) return null;
        return NotificationPreferenceModel.findOneAndUpdate(
          { userId: args.userId },
          { $setOnInsert: { userId: args.userId } },
          { upsert: true, new: true },
        );
      },
    },
    userPushSubscriptions: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'PushSubscriptionType',
        fields: {
          _id: { type: GraphQLID },
          userId: { type: GraphQLString },
          deviceName: { type: GraphQLString },
          browserInfo: { type: GraphQLString },
          isActive: { type: GraphQLBoolean },
          createdAt: { type: GraphQLString },
          lastUsedAt: { type: GraphQLString },
        },
      })),
      args: { userId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.userId) return [];
        return PushSubscriptionModel.find({ userId: args.userId, isActive: true });
      },
    },
    notificationCenter: {
      type: new GraphQLObjectType({
        name: 'NotificationCenterType',
        fields: {
          notifications: { type: new GraphQLList(NotificationType) },
          unreadCount: { type: GraphQLInt },
          totalCount: { type: GraphQLInt },
        },
      }),
      args: {
        userId: { type: GraphQLString },
        category: { type: GraphQLString },
        unreadOnly: { type: GraphQLBoolean },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        if (!args.userId) return null;
        const filter: Record<string, unknown> = { userId: args.userId };
        if (args.category) filter.type = args.category;
        if (args.unreadOnly) filter.read = false;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filter.createdAt = { $gte: thirtyDaysAgo };
        const limit = clampLimit(args.limit, 50, 100);
        const notifications = await NotificationModel.find(filter)
          .sort({ createdAt: -1 }).limit(limit);
        const unreadCount = await NotificationModel.countDocuments({
          userId: args.userId,
          read: false,
          createdAt: { $gte: thirtyDaysAgo },
        });
        const totalCount = await NotificationModel.countDocuments({
          userId: args.userId,
          createdAt: { $gte: thirtyDaysAgo },
        });
        return { notifications, unreadCount, totalCount };
      },
    },
    scheduledNotifications: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'ScheduledNotificationType',
        fields: {
          _id: { type: GraphQLID },
          userId: { type: GraphQLString },
          shelterId: { type: GraphQLString },
          title: { type: GraphQLString },
          body: { type: GraphQLString },
          category: { type: GraphQLString },
          url: { type: GraphQLString },
          scheduledFor: { type: GraphQLString },
          status: { type: GraphQLString },
          isBatch: { type: GraphQLBoolean },
        },
      })),
      args: {
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return [];
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.status) filter.status = args.status;
        return ScheduledNotificationModel.find(filter).sort({ scheduledFor: 1 });
      },
    },
    pushNotificationAnalytics: {
      type: new GraphQLObjectType({
        name: 'PushNotificationAnalyticsType',
        fields: {
          totalSubscribers: { type: GraphQLInt },
          activeSubscribers: { type: GraphQLInt },
          totalNotificationsSent: { type: GraphQLInt },
          scheduledPending: { type: GraphQLInt },
        },
      }),
      args: { shelterId: { type: GraphQLString } },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const totalSubs = await PushSubscriptionModel.countDocuments({});
        const activeSubs = await PushSubscriptionModel.countDocuments({ isActive: true });
        const notifications = await NotificationModel.countDocuments({
          shelterId: args.shelterId,
        });
        const pending = await ScheduledNotificationModel.countDocuments({
          shelterId: args.shelterId,
          status: 'pending',
        });
        return {
          totalSubscribers: totalSubs,
          activeSubscribers: activeSubs,
          totalNotificationsSent: notifications,
          scheduledPending: pending,
        };
      },
    },

    // F6.4 - Social Sharing
    shareCount: {
      type: new GraphQLObjectType({
        name: 'ShareCountType',
        fields: {
          entityId: { type: GraphQLString },
          totalShares: { type: GraphQLInt },
          totalClicks: { type: GraphQLInt },
          totalApplications: { type: GraphQLInt },
          byPlatform: {
            type: new GraphQLList(new GraphQLObjectType({
              name: 'PlatformShareCountType',
              fields: {
                platform: { type: GraphQLString },
                shares: { type: GraphQLInt },
                clicks: { type: GraphQLInt },
              },
            })),
          },
        },
      }),
      args: {
        entityType: { type: GraphQLString },
        entityId: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.entityId) return null;
        const filter: Record<string, unknown> = { entityId: args.entityId };
        if (args.entityType) filter.entityType = args.entityType;
        const events = await ShareEventModel.find(filter);
        const platformMap = new Map<string, { shares: number; clicks: number }>();
        let totalClicks = 0;
        let totalApps = 0;
        for (const e of events) {
          const existing = platformMap.get(e.platform) ?? { shares: 0, clicks: 0 };
          existing.shares += 1;
          existing.clicks += e.clickCount;
          platformMap.set(e.platform, existing);
          totalClicks += e.clickCount;
          totalApps += e.applicationCount;
        }
        const byPlatform = Array.from(platformMap.entries()).map(([platform, data]) => ({
          platform,
          ...data,
        }));
        return {
          entityId: args.entityId,
          totalShares: events.length,
          totalClicks,
          totalApplications: totalApps,
          byPlatform,
        };
      },
    },
    sharingAnalytics: {
      type: new GraphQLObjectType({
        name: 'SharingAnalyticsType',
        fields: {
          totalShares: { type: GraphQLInt },
          totalClicks: { type: GraphQLInt },
          totalApplicationsFromShares: { type: GraphQLInt },
          topPlatform: { type: GraphQLString },
          topSharedEntityId: { type: GraphQLString },
        },
      }),
      args: {
        shelterId: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (!args.shelterId) return null;
        const filter: Record<string, unknown> = { shelterId: args.shelterId };
        if (args.startDate || args.endDate) {
          const dateFilter: Record<string, Date> = {};
          if (args.startDate) dateFilter.$gte = new Date(args.startDate);
          if (args.endDate) dateFilter.$lte = new Date(args.endDate);
          filter.createdAt = dateFilter;
        }
        const events = await ShareEventModel.find(filter);
        const platformCounts = new Map<string, number>();
        const entityCounts = new Map<string, number>();
        let totalClicks = 0;
        let totalApps = 0;
        for (const e of events) {
          platformCounts.set(e.platform, (platformCounts.get(e.platform) ?? 0) + 1);
          entityCounts.set(e.entityId, (entityCounts.get(e.entityId) ?? 0) + 1);
          totalClicks += e.clickCount;
          totalApps += e.applicationCount;
        }
        let topPlatform = '';
        let topPlatformCount = 0;
        platformCounts.forEach((count, platform) => {
          if (count > topPlatformCount) {
            topPlatform = platform;
            topPlatformCount = count;
          }
        });
        let topEntity = '';
        let topEntityCount = 0;
        entityCounts.forEach((count, entity) => {
          if (count > topEntityCount) {
            topEntity = entity;
            topEntityCount = count;
          }
        });
        return {
          totalShares: events.length,
          totalClicks,
          totalApplicationsFromShares: totalApps,
          topPlatform,
          topSharedEntityId: topEntity,
        };
      },
    },
    referralTracking: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'ReferralTrackingType',
        fields: {
          _id: { type: GraphQLID },
          entityType: { type: GraphQLString },
          entityId: { type: GraphQLString },
          userId: { type: GraphQLString },
          platform: { type: GraphQLString },
          referralCode: { type: GraphQLString },
          clickCount: { type: GraphQLInt },
          applicationCount: { type: GraphQLInt },
          createdAt: { type: GraphQLString },
        },
      })),
      args: {
        referralCode: { type: GraphQLString },
        userId: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.referralCode) filter.referralCode = args.referralCode;
        if (args.userId) filter.userId = args.userId;
        if (Object.keys(filter).length === 0) return [];
        return ShareEventModel.find(filter).sort({ createdAt: -1 });
      },
    },
    // F7.1 - Public Pet Listings
    publicAnimalSearch: {
      type: new GraphQLObjectType({
        name: 'PublicAnimalSearchResultType',
        fields: {
          animals: { type: new GraphQLList(AnimalType) },
          totalCount: { type: GraphQLInt },
          facets: {
            type: new GraphQLObjectType({
              name: 'SearchFacetsType',
              fields: {
                types: { type: new GraphQLList(new GraphQLObjectType({
                  name: 'FacetBucketType',
                  fields: {
                    value: { type: GraphQLString },
                    count: { type: GraphQLInt },
                  },
                })) },
                breeds: { type: new GraphQLList(new GraphQLObjectType({
                  name: 'BreedFacetBucketType',
                  fields: {
                    value: { type: GraphQLString },
                    count: { type: GraphQLInt },
                  },
                })) },
                sizes: { type: new GraphQLList(new GraphQLObjectType({
                  name: 'SizeFacetBucketType',
                  fields: {
                    value: { type: GraphQLString },
                    count: { type: GraphQLInt },
                  },
                })) },
                sexes: { type: new GraphQLList(new GraphQLObjectType({
                  name: 'SexFacetBucketType',
                  fields: {
                    value: { type: GraphQLString },
                    count: { type: GraphQLInt },
                  },
                })) },
              },
            }),
          },
        },
      }),
      args: {
        query: { type: GraphQLString },
        type: { type: GraphQLString },
        breed: { type: GraphQLString },
        sex: { type: GraphQLString },
        size: { type: GraphQLString },
        color: { type: GraphQLString },
        energyLevel: { type: GraphQLString },
        goodWithKids: { type: GraphQLBoolean },
        goodWithDogs: { type: GraphQLBoolean },
        goodWithCats: { type: GraphQLBoolean },
        houseTrained: { type: GraphQLBoolean },
        minAge: { type: GraphQLInt },
        maxAge: { type: GraphQLInt },
        shelterId: { type: GraphQLString },
        sortBy: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = { status: 'available' };
        if (args.query) {
          filter.$text = { $search: args.query };
        }
        if (args.type) filter.type = args.type;
        if (args.breed) filter.breed = { $regex: args.breed, $options: 'i' };
        if (args.sex) filter.sex = args.sex;
        if (args.size) filter.size = args.size;
        if (args.color) filter.color = { $regex: args.color, $options: 'i' };
        if (args.energyLevel) filter.energyLevel = args.energyLevel;
        if (args.goodWithKids !== undefined) filter.goodWithKids = args.goodWithKids;
        if (args.goodWithDogs !== undefined) filter.goodWithDogs = args.goodWithDogs;
        if (args.goodWithCats !== undefined) filter.goodWithCats = args.goodWithCats;
        if (args.houseTrained !== undefined) filter.houseTrained = args.houseTrained;
        if (args.minAge !== undefined || args.maxAge !== undefined) {
          const ageFilter: Record<string, number> = {};
          if (args.minAge !== undefined) ageFilter.$gte = args.minAge;
          if (args.maxAge !== undefined) ageFilter.$lte = args.maxAge;
          filter.age = ageFilter;
        }
        if (args.shelterId) filter.shelterId = args.shelterId;
        const sortOptions: Record<string, Record<string, 1 | -1>> = {
          newest: { _id: -1 },
          oldest: { _id: 1 },
          name_asc: { name: 1 },
          name_desc: { name: -1 },
          age_asc: { age: 1 },
          age_desc: { age: -1 },
        };
        const sort = sortOptions[args.sortBy ?? ''] ?? { _id: -1 };
        const limit = clampLimit(args.limit, DEFAULT_ANIMAL_LIMIT, MAX_ANIMAL_LIMIT);
        const offset = args.offset ?? 0;
        const [animals, totalCount] = await Promise.all([
          Animal.find(filter).sort(sort).skip(offset).limit(limit),
          Animal.countDocuments(filter),
        ]);
        const facetFilter: Record<string, unknown> = { status: 'available' };
        const allAvailable = await Animal.find(facetFilter).select('type breed size sex').lean();
        const typeCounts = new Map<string, number>();
        const breedCounts = new Map<string, number>();
        const sizeCounts = new Map<string, number>();
        const sexCounts = new Map<string, number>();
        for (const a of allAvailable) {
          if (a.type) typeCounts.set(a.type, (typeCounts.get(a.type) ?? 0) + 1);
          if (a.breed) breedCounts.set(a.breed, (breedCounts.get(a.breed) ?? 0) + 1);
          if (a.size) sizeCounts.set(a.size, (sizeCounts.get(a.size) ?? 0) + 1);
          if (a.sex) sexCounts.set(a.sex, (sexCounts.get(a.sex) ?? 0) + 1);
        }
        const toFacetArray = (map: Map<string, number>) =>
          Array.from(map.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
        return {
          animals,
          totalCount,
          facets: {
            types: toFacetArray(typeCounts),
            breeds: toFacetArray(breedCounts).slice(0, 20),
            sizes: toFacetArray(sizeCounts),
            sexes: toFacetArray(sexCounts),
          },
        };
      },
    },
    publicAnimalDetail: {
      type: new GraphQLObjectType({
        name: 'PublicAnimalDetailType',
        fields: {
          animal: { type: AnimalType },
          shelter: { type: ShelterType },
          structuredData: { type: GraphQLString },
          breadcrumbs: { type: new GraphQLList(new GraphQLObjectType({
            name: 'BreadcrumbType',
            fields: {
              label: { type: GraphQLString },
              url: { type: GraphQLString },
            },
          })) },
        },
      }),
      args: {
        id: { type: GraphQLString },
        slug: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        let animal = null;
        if (args.id) {
          animal = await Animal.findById(args.id);
        } else if (args.slug) {
          animal = await Animal.findOne({ slug: args.slug });
        }
        if (!animal) return null;
        let shelter = null;
        if (animal.shelterId) {
          shelter = await Shelter.findById(animal.shelterId);
        } else {
          shelter = await Shelter.findOne({ animals: animal._id });
        }
        const structuredData = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: animal.name,
          description: animal.metaDescription || animal.description,
          image: animal.image,
          brand: shelter ? { '@type': 'Organization', name: shelter.name } : undefined,
          offers: animal.adoptionFee ? {
            '@type': 'Offer',
            price: animal.adoptionFee,
            priceCurrency: 'USD',
            availability: animal.status === 'available'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          } : undefined,
        });
        const breadcrumbs = [
          { label: 'Home', url: '/' },
          { label: 'Pets', url: '/pets' },
        ];
        if (animal.type) {
          breadcrumbs.push({ label: animal.type, url: `/pets?type=${animal.type}` });
        }
        breadcrumbs.push({ label: animal.name, url: `/pets/${animal.slug || animal._id}` });
        return { animal, shelter, structuredData, breadcrumbs };
      },
    },
    publicShelterProfile: {
      type: new GraphQLObjectType({
        name: 'PublicShelterProfileType',
        fields: {
          shelter: { type: ShelterType },
          availableAnimals: { type: new GraphQLList(AnimalType) },
          totalAvailable: { type: GraphQLInt },
          structuredData: { type: GraphQLString },
        },
      }),
      args: {
        id: { type: GraphQLString },
        slug: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        let shelter = null;
        if (args.id) {
          shelter = await Shelter.findById(args.id);
        } else if (args.slug) {
          shelter = await Shelter.findOne({ slug: args.slug });
        }
        if (!shelter) return null;
        const availableAnimals = await Animal.find({
          _id: { $in: shelter.animals },
          status: 'available',
        }).limit(50);
        const totalAvailable = await Animal.countDocuments({
          _id: { $in: shelter.animals },
          status: 'available',
        });
        const structuredData = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: shelter.name,
          description: shelter.description || '',
          address: shelter.location,
          telephone: shelter.phone || undefined,
          email: shelter.email || undefined,
          url: shelter.website || undefined,
          logo: shelter.logo || undefined,
        });
        return { shelter, availableAnimals, totalAvailable, structuredData };
      },
    },
    nearbyAnimals: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'NearbyAnimalResultType',
        fields: {
          animal: { type: AnimalType },
          shelterName: { type: GraphQLString },
          shelterLocation: { type: GraphQLString },
          distanceMiles: { type: GraphQLFloat },
        },
      })),
      args: {
        latitude: { type: new GraphQLNonNull(GraphQLFloat) },
        longitude: { type: new GraphQLNonNull(GraphQLFloat) },
        radiusMiles: { type: GraphQLFloat },
        type: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const radiusMiles = args.radiusMiles ?? 25;
        const radiusMeters = radiusMiles * 1609.34;
        const nearbyShelters = await Shelter.find({
          coordinates: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [args.longitude, args.latitude],
              },
              $maxDistance: radiusMeters,
            },
          },
        }).limit(50);
        if (nearbyShelters.length === 0) return [];
        const shelterMap = new Map<string, typeof nearbyShelters[0]>();
        for (const s of nearbyShelters) {
          shelterMap.set(s._id.toString(), s);
        }
        const allAnimalIds = nearbyShelters.flatMap(s => s.animals);
        const animalFilter: Record<string, unknown> = {
          _id: { $in: allAnimalIds },
          status: 'available',
        };
        if (args.type) animalFilter.type = args.type;
        const limit = clampLimit(args.limit, 20, MAX_ANIMAL_LIMIT);
        const animals = await Animal.find(animalFilter).limit(limit);
        const toRad = (deg: number) => deg * (Math.PI / 180);
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 3958.8;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };
        const results = [];
        for (const animal of animals) {
          let ownerShelter = null;
          if (animal.shelterId) {
            ownerShelter = shelterMap.get(animal.shelterId.toString());
          }
          if (!ownerShelter) {
            for (const s of nearbyShelters) {
              if (s.animals.some(aId => aId.toString() === animal._id.toString())) {
                ownerShelter = s;
                break;
              }
            }
          }
          if (!ownerShelter) continue;
          const coords = ownerShelter.coordinates?.coordinates;
          const dist = coords
            ? haversine(args.latitude, args.longitude, coords[1], coords[0])
            : 0;
          results.push({
            animal,
            shelterName: ownerShelter.name,
            shelterLocation: ownerShelter.location,
            distanceMiles: Math.round(dist * 10) / 10,
          });
        }
        results.sort((a, b) => a.distanceMiles - b.distanceMiles);
        return results;
      },
    },
    relatedAnimals: {
      type: new GraphQLList(AnimalType),
      args: {
        animalId: { type: new GraphQLNonNull(GraphQLID) },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const animal = await Animal.findById(args.animalId);
        if (!animal) return [];
        const limit = clampLimit(args.limit, 6, 20);
        const related = await Animal.find({
          _id: { $ne: animal._id },
          status: 'available',
          type: animal.type,
        }).limit(limit * 3);
        const scored = related.map(r => {
          let score = 0;
          if (r.breed === animal.breed) score += 3;
          if (r.size === animal.size) score += 2;
          if (r.energyLevel === animal.energyLevel) score += 1;
          if (r.sex === animal.sex) score += 1;
          const ageDiff = Math.abs(r.age - animal.age);
          if (ageDiff <= 1) score += 2;
          else if (ageDiff <= 3) score += 1;
          return { animal: r, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(s => s.animal);
      },
    },
    publicSearchFacets: {
      type: new GraphQLObjectType({
        name: 'PublicSearchFacetsType',
        fields: {
          types: { type: new GraphQLList(GraphQLString) },
          breeds: { type: new GraphQLList(GraphQLString) },
          sizes: { type: new GraphQLList(GraphQLString) },
          colors: { type: new GraphQLList(GraphQLString) },
          energyLevels: { type: new GraphQLList(GraphQLString) },
        },
      }),
      async resolve() {
        const animals = await Animal.find({ status: 'available' })
          .select('type breed size color energyLevel').lean();
        const types = new Set<string>();
        const breeds = new Set<string>();
        const sizes = new Set<string>();
        const colors = new Set<string>();
        const energyLevels = new Set<string>();
        for (const a of animals) {
          if (a.type) types.add(a.type);
          if (a.breed) breeds.add(a.breed);
          if (a.size) sizes.add(a.size);
          if (a.color) colors.add(a.color);
          if (a.energyLevel) energyLevels.add(a.energyLevel);
        }
        return {
          types: Array.from(types).sort(),
          breeds: Array.from(breeds).sort(),
          sizes: Array.from(sizes).sort(),
          colors: Array.from(colors).sort(),
          energyLevels: Array.from(energyLevels).sort(),
        };
      },
    },
    sitemapData: {
      type: new GraphQLObjectType({
        name: 'SitemapDataType',
        fields: {
          animals: { type: new GraphQLList(new GraphQLObjectType({
            name: 'SitemapAnimalEntryType',
            fields: {
              id: { type: GraphQLID },
              slug: { type: GraphQLString },
              name: { type: GraphQLString },
              type: { type: GraphQLString },
              updatedAt: { type: GraphQLString },
            },
          })) },
          shelters: { type: new GraphQLList(new GraphQLObjectType({
            name: 'SitemapShelterEntryType',
            fields: {
              id: { type: GraphQLID },
              slug: { type: GraphQLString },
              name: { type: GraphQLString },
            },
          })) },
        },
      }),
      async resolve() {
        const animals = await Animal.find({ status: 'available' })
          .select('_id slug name type').lean();
        const shelters = await Shelter.find({}).select('_id slug name').lean();
        return {
          animals: animals.map(a => ({
            id: a._id.toString(),
            slug: a.slug || '',
            name: a.name,
            type: a.type,
            updatedAt: new Date().toISOString(),
          })),
          shelters: shelters.map(s => ({
            id: s._id.toString(),
            slug: s.slug || '',
            name: s.name,
          })),
        };
      },
    },
    // F7.2 - User Accounts
    adopterDashboard: {
      type: new GraphQLObjectType({
        name: 'AdopterDashboardType',
        fields: {
          user: { type: UserType },
          profile: { type: AdopterProfileType },
          favoriteAnimals: { type: new GraphQLList(AnimalType) },
          recentApplications: { type: new GraphQLList(ApplicationType) },
          adoptionRecords: { type: new GraphQLList(AdoptionRecordType) },
          recommendedAnimals: { type: new GraphQLList(AnimalType) },
          profileCompletion: { type: GraphQLInt },
        },
      }),
      async resolve(_parent, _args, context) {
        const ctx = context as GraphQLContext;
        const userId = requireAuth(ctx);
        const user = await User.findById(userId);
        if (!user) return null;
        const profile = await AdopterProfileModel.findOne({ userId });
        const favoriteIds = user.favorites?.map(id => id.toString()) ?? [];
        const favoriteAnimals = favoriteIds.length > 0
          ? await Animal.find({ _id: { $in: favoriteIds } })
          : [];
        const recentApplications = await Application.find({ userId })
          .sort({ submittedAt: -1 }).limit(10);
        const adoptionRecords = await AdoptionRecordModel.find({ adopterId: userId })
          .sort({ adoptionDate: -1 });
        let recommendedAnimals: typeof favoriteAnimals = [];
        if (profile) {
          const recFilter: Record<string, unknown> = { status: 'available' };
          if (profile.preferredSpecies?.length > 0) {
            recFilter.type = { $in: profile.preferredSpecies };
          }
          if (profile.preferredSize?.length > 0) {
            recFilter.size = { $in: profile.preferredSize };
          }
          recommendedAnimals = await Animal.find(recFilter).limit(6);
        }
        const profileFields = [
          user.name, user.email, user.bio, user.phone, user.avatar,
        ];
        const adopterFields = profile ? [
          profile.housingType, profile.activityLevel,
          profile.experienceLevel, profile.preferredSpecies?.length > 0,
        ] : [];
        const filledCount = profileFields.filter(Boolean).length + adopterFields.filter(Boolean).length;
        const totalFields = profileFields.length + 4;
        const profileCompletion = Math.round((filledCount / totalFields) * 100);
        return {
          user,
          profile,
          favoriteAnimals,
          recentApplications,
          adoptionRecords,
          recommendedAnimals,
          profileCompletion,
        };
      },
    },
    userAdoptionHistory: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'AdoptionHistoryEntryType',
        fields: {
          application: { type: ApplicationType },
          animal: { type: AnimalType },
          shelter: { type: ShelterType },
          adoptionRecord: { type: AdoptionRecordType },
          status: { type: GraphQLString },
        },
      })),
      async resolve(_parent, _args, context) {
        const ctx = context as GraphQLContext;
        const userId = requireAuth(ctx);
        const applications = await Application.find({ userId }).sort({ submittedAt: -1 });
        const results = [];
        for (const app of applications) {
          const animal = await Animal.findById(app.animalId);
          let shelter = null;
          if (animal?.shelterId) {
            shelter = await Shelter.findById(animal.shelterId);
          } else if (animal) {
            shelter = await Shelter.findOne({ animals: animal._id });
          }
          const adoptionRecord = await AdoptionRecordModel.findOne({
            applicationId: app._id.toString(),
          });
          results.push({
            application: app,
            animal,
            shelter,
            adoptionRecord,
            status: adoptionRecord ? 'adopted' : app.status,
          });
        }
        return results;
      },
    },
    myFavorites: {
      type: new GraphQLObjectType({
        name: 'MyFavoritesResultType',
        fields: {
          animals: { type: new GraphQLList(AnimalType) },
          totalCount: { type: GraphQLInt },
        },
      }),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve(_parent, args, context) {
        const ctx = context as GraphQLContext;
        const userId = requireAuth(ctx);
        const user = await User.findById(userId);
        if (!user) return { animals: [], totalCount: 0 };
        const favoriteIds = user.favorites?.map(id => id.toString()) ?? [];
        const totalCount = favoriteIds.length;
        const offset = (args as Record<string, number>).offset ?? 0;
        const limit = clampLimit((args as Record<string, number>).limit, 20, MAX_ANIMAL_LIMIT);
        const pageIds = favoriteIds.slice(offset, offset + limit);
        const animals = pageIds.length > 0
          ? await Animal.find({ _id: { $in: pageIds } })
          : [];
        return { animals, totalCount };
      },
    },
    profileCompletion: {
      type: new GraphQLObjectType({
        name: 'ProfileCompletionType',
        fields: {
          percentage: { type: GraphQLInt },
          missingFields: { type: new GraphQLList(GraphQLString) },
        },
      }),
      async resolve(_parent, _args, context) {
        const ctx = context as GraphQLContext;
        const userId = requireAuth(ctx);
        const user = await User.findById(userId);
        if (!user) return { percentage: 0, missingFields: [] };
        const profile = await AdopterProfileModel.findOne({ userId });
        const checks: Array<{ field: string; filled: boolean }> = [
          { field: 'name', filled: Boolean(user.name) },
          { field: 'email', filled: Boolean(user.email) },
          { field: 'bio', filled: Boolean(user.bio) },
          { field: 'phone', filled: Boolean(user.phone) },
          { field: 'avatar', filled: Boolean(user.avatar) },
          { field: 'housingType', filled: Boolean(profile?.housingType) },
          { field: 'activityLevel', filled: Boolean(profile?.activityLevel) },
          { field: 'experienceLevel', filled: Boolean(profile?.experienceLevel) },
          { field: 'preferredSpecies', filled: (profile?.preferredSpecies?.length ?? 0) > 0 },
        ];
        const filled = checks.filter(c => c.filled).length;
        const missing = checks.filter(c => !c.filled).map(c => c.field);
        return {
          percentage: Math.round((filled / checks.length) * 100),
          missingFields: missing,
        };
      },
    },
    // F7.3 - Success Stories
    successStoryGallery: {
      type: new GraphQLObjectType({
        name: 'SuccessStoryGalleryType',
        fields: {
          stories: { type: new GraphQLList(SuccessStoryType) },
          totalCount: { type: GraphQLInt },
        },
      }),
      args: {
        animalType: { type: GraphQLString },
        shelterId: { type: GraphQLString },
        search: { type: GraphQLString },
        sortBy: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {
          status: { $in: ['approved', 'featured'] },
        };
        if (args.animalType) filter.animalType = args.animalType;
        if (args.shelterId) filter.shelterId = args.shelterId;
        if (args.search) filter.$text = { $search: args.search };
        const sortOptions: Record<string, Record<string, 1 | -1>> = {
          newest: { createdAt: -1 },
          oldest: { createdAt: 1 },
          most_viewed: { viewCount: -1 },
          most_shared: { shareCount: -1 },
        };
        const sort = sortOptions[args.sortBy ?? ''] ?? { createdAt: -1 };
        const limit = clampLimit(args.limit, 20, MAX_ANIMAL_LIMIT);
        const offset = args.offset ?? 0;
        const [stories, totalCount] = await Promise.all([
          SuccessStoryModel.find(filter).sort(sort).skip(offset).limit(limit),
          SuccessStoryModel.countDocuments(filter),
        ]);
        return { stories, totalCount };
      },
    },
    successStoryDetail: {
      type: SuccessStoryType,
      args: {
        id: { type: GraphQLString },
        slug: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        let story = null;
        if (args.id) {
          story = await SuccessStoryModel.findById(args.id);
        } else if (args.slug) {
          story = await SuccessStoryModel.findOne({ slug: args.slug });
        }
        if (story && ['approved', 'featured'].includes(story.status ?? '')) {
          await SuccessStoryModel.findByIdAndUpdate(story._id, { $inc: { viewCount: 1 } });
        }
        return story;
      },
    },
    featuredSuccessStories: {
      type: new GraphQLList(SuccessStoryType),
      args: {
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const limit = clampLimit(args.limit, 5, 20);
        return SuccessStoryModel.find({ isFeatured: true, status: 'featured' })
          .sort({ featuredAt: -1 })
          .limit(limit);
      },
    },
    storyModerationQueue: {
      type: new GraphQLList(SuccessStoryType),
      args: {
        shelterId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(_parent, args, context) {
        const ctx = context as GraphQLContext;
        requireAuth(ctx);
        const filter: Record<string, unknown> = {};
        if (args.shelterId) filter.shelterId = args.shelterId;
        filter.status = args.status ?? 'pending';
        return SuccessStoryModel.find(filter).sort({ createdAt: -1 });
      },
    },
    successStoryAnalytics: {
      type: new GraphQLObjectType({
        name: 'SuccessStoryAnalyticsType',
        fields: {
          totalStories: { type: GraphQLInt },
          totalApproved: { type: GraphQLInt },
          totalPending: { type: GraphQLInt },
          totalViews: { type: GraphQLInt },
          totalShares: { type: GraphQLInt },
          totalReactions: { type: GraphQLInt },
          averageViewsPerStory: { type: GraphQLFloat },
          topAnimalType: { type: GraphQLString },
        },
      }),
      args: {
        shelterId: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.shelterId) filter.shelterId = args.shelterId;
        const stories = await SuccessStoryModel.find(filter).lean();
        const approved = stories.filter(s => s.status === 'approved' || s.status === 'featured');
        const pending = stories.filter(s => s.status === 'pending');
        let totalViews = 0;
        let totalShares = 0;
        let totalReactions = 0;
        const typeCounts = new Map<string, number>();
        for (const s of stories) {
          totalViews += s.viewCount ?? 0;
          totalShares += s.shareCount ?? 0;
          const r = s.reactions ?? { heart: 0, celebrate: 0, inspiring: 0 };
          totalReactions += r.heart + r.celebrate + r.inspiring;
          typeCounts.set(s.animalType, (typeCounts.get(s.animalType) ?? 0) + 1);
        }
        let topAnimalType = '';
        let topCount = 0;
        typeCounts.forEach((count, animalType) => {
          if (count > topCount) {
            topAnimalType = animalType;
            topCount = count;
          }
        });
        return {
          totalStories: stories.length,
          totalApproved: approved.length,
          totalPending: pending.length,
          totalViews,
          totalShares,
          totalReactions,
          averageViewsPerStory: stories.length > 0 ? totalViews / stories.length : 0,
          topAnimalType,
        };
      },
    },
    // F7.4 - Events & Calendar
    publicEventCalendar: {
      type: new GraphQLObjectType({
        name: 'PublicEventCalendarType',
        fields: {
          events: { type: new GraphQLList(EventType) },
          totalCount: { type: GraphQLInt },
        },
      }),
      args: {
        shelterId: { type: GraphQLString },
        eventType: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
        tag: { type: GraphQLString },
        isVirtual: { type: GraphQLBoolean },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = { status: 'published' };
        if (args.shelterId) filter.shelterId = args.shelterId;
        if (args.eventType) filter.eventType = args.eventType;
        if (args.isVirtual !== undefined) filter.isVirtual = args.isVirtual;
        if (args.tag) filter.tags = args.tag;
        if (args.startDate || args.endDate) {
          const dateFilter: Record<string, Date> = {};
          if (args.startDate) dateFilter.$gte = new Date(args.startDate);
          if (args.endDate) dateFilter.$lte = new Date(args.endDate);
          filter.date = dateFilter;
        }
        const limit = clampLimit(args.limit, 20, MAX_ANIMAL_LIMIT);
        const offset = args.offset ?? 0;
        const [events, totalCount] = await Promise.all([
          EventModel.find(filter).sort({ date: 1 }).skip(offset).limit(limit),
          EventModel.countDocuments(filter),
        ]);
        return { events, totalCount };
      },
    },
    eventDetail: {
      type: EventType,
      args: {
        id: { type: GraphQLString },
        slug: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        if (args.id) return EventModel.findById(args.id);
        if (args.slug) return EventModel.findOne({ slug: args.slug });
        return null;
      },
    },
    upcomingEvents: {
      type: new GraphQLList(EventType),
      args: {
        shelterId: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {
          status: 'published',
          date: { $gte: new Date() },
        };
        if (args.shelterId) filter.shelterId = args.shelterId;
        const limit = clampLimit(args.limit, 10, 50);
        return EventModel.find(filter).sort({ date: 1 }).limit(limit);
      },
    },
    eventRegistrations: {
      type: new GraphQLObjectType({
        name: 'EventRegistrationsResultType',
        fields: {
          registered: { type: GraphQLInt },
          waitlisted: { type: GraphQLInt },
          attended: { type: GraphQLInt },
          cancelled: { type: GraphQLInt },
          capacity: { type: GraphQLInt },
          isFull: { type: GraphQLBoolean },
        },
      }),
      args: {
        eventId: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const event = await EventModel.findById(args.eventId);
        if (!event) return null;
        const registered = event.registrations.filter(r => r.status === 'registered').length;
        const waitlisted = event.waitlist.length;
        const attended = event.registrations.filter(r => r.status === 'attended').length;
        const cancelled = event.registrations.filter(r => r.status === 'cancelled').length;
        return {
          registered,
          waitlisted,
          attended,
          cancelled,
          capacity: event.capacity,
          isFull: event.capacity > 0 && registered >= event.capacity,
        };
      },
    },
    eventAnalytics: {
      type: new GraphQLObjectType({
        name: 'EventAnalyticsType',
        fields: {
          totalEvents: { type: GraphQLInt },
          totalRegistrations: { type: GraphQLInt },
          totalAttendance: { type: GraphQLInt },
          totalApplicationsGenerated: { type: GraphQLInt },
          averageAttendanceRate: { type: GraphQLFloat },
          topEventType: { type: GraphQLString },
        },
      }),
      args: {
        shelterId: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const filter: Record<string, unknown> = {};
        if (args.shelterId) filter.shelterId = args.shelterId;
        if (args.startDate || args.endDate) {
          const dateFilter: Record<string, Date> = {};
          if (args.startDate) dateFilter.$gte = new Date(args.startDate);
          if (args.endDate) dateFilter.$lte = new Date(args.endDate);
          filter.date = dateFilter;
        }
        const events = await EventModel.find(filter).lean();
        let totalRegs = 0;
        let totalAttendance = 0;
        let totalApps = 0;
        const typeCounts = new Map<string, number>();
        for (const e of events) {
          totalRegs += e.registrationCount ?? 0;
          totalAttendance += e.attendanceCount ?? 0;
          totalApps += e.applicationsGenerated ?? 0;
          typeCounts.set(e.eventType, (typeCounts.get(e.eventType) ?? 0) + 1);
        }
        let topEventType = '';
        let topCount = 0;
        typeCounts.forEach((count, eventType) => {
          if (count > topCount) {
            topEventType = eventType;
            topCount = count;
          }
        });
        return {
          totalEvents: events.length,
          totalRegistrations: totalRegs,
          totalAttendance,
          totalApplicationsGenerated: totalApps,
          averageAttendanceRate: totalRegs > 0 ? totalAttendance / totalRegs : 0,
          topEventType,
        };
      },
    },
    eventIcalExport: {
      type: GraphQLString,
      args: {
        eventId: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const event = await EventModel.findById(args.eventId);
        if (!event) return null;
        const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const lines = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//SaveAStray//Events//EN',
          'BEGIN:VEVENT',
          `DTSTART:${formatDate(event.date)}`,
        ];
        if (event.endDate) {
          lines.push(`DTEND:${formatDate(event.endDate)}`);
        }
        lines.push(
          `SUMMARY:${event.title}`,
          `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
          `LOCATION:${event.isVirtual ? event.virtualLink : event.location}`,
          `UID:${event._id}@saveastray`,
          'END:VEVENT',
          'END:VCALENDAR',
        );
        return lines.join('\r\n');
      },
    },

    // ── F9.1 Shelter Analytics ──────────────────────────────────

    shelterAdoptionMetrics: {
      type: new GraphQLObjectType({
        name: 'ShelterAdoptionMetrics',
        fields: {
          shelterId: { type: GraphQLString },
          totalAdoptions: { type: GraphQLInt },
          totalIntakes: { type: GraphQLInt },
          monthlyData: { type: new GraphQLList(new GraphQLObjectType({
            name: 'MonthlyAdoptionData',
            fields: {
              month: { type: GraphQLString },
              adoptions: { type: GraphQLInt },
              intakes: { type: GraphQLInt },
              returns: { type: GraphQLInt },
              netChange: { type: GraphQLInt },
            },
          }))},
          adoptionRate: { type: GraphQLFloat },
          averageLengthOfStayDays: { type: GraphQLFloat },
          returnRate: { type: GraphQLFloat },
          periodStart: { type: GraphQLString },
          periodEnd: { type: GraphQLString },
        },
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const shelterId = args.shelterId as string;
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const endDate = args.endDate ? new Date(args.endDate as string) : now;

        const AnimalModel = mongoose.model<AnimalDocument>('animal');
        const IntakeModel = mongoose.model<IntakeLogDocument>('IntakeLog');
        const OutcomeModel = mongoose.model<OutcomeLogDocument>('OutcomeLog');

        const animals = await AnimalModel.find({ shelter: shelterId }).lean();
        const filtered = animals.filter(a => {
          const ts = a._id.getTimestamp();
          return ts >= startDate && ts <= endDate;
        });

        const adoptions = filtered.filter(a => a.status === 'adopted');
        const intakes = await IntakeModel.countDocuments({
          shelterId,
          intakeDate: { $gte: startDate, $lte: endDate },
        });
        const outcomes = await OutcomeModel.find({
          shelterId,
          outcomeDate: { $gte: startDate, $lte: endDate },
        }).lean();

        const months: Record<string, { adoptions: number; intakes: number; returns: number }> = {};
        let current = new Date(startDate);
        while (current <= endDate) {
          const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          months[key] = { adoptions: 0, intakes: 0, returns: 0 };
          current.setMonth(current.getMonth() + 1);
        }

        for (const a of adoptions) {
          const d = a._id.getTimestamp();
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (months[key]) months[key].adoptions++;
        }

        for (const o of outcomes) {
          const d = new Date(o.outcomeDate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (months[key] && o.outcomeType === 'return_to_owner') months[key].returns++;
        }

        const monthlyData = Object.entries(months).map(([month, data]) => ({
          month,
          ...data,
          netChange: data.intakes - data.adoptions - data.returns,
        }));

        const totalAdoptions = adoptions.length;
        const totalReturns = outcomes.filter(o => o.outcomeType === 'return_to_owner').length;

        return {
          shelterId,
          totalAdoptions,
          totalIntakes: intakes,
          monthlyData,
          adoptionRate: filtered.length > 0 ? totalAdoptions / filtered.length : 0,
          averageLengthOfStayDays: 0,
          returnRate: totalAdoptions > 0 ? totalReturns / totalAdoptions : 0,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
        };
      },
    },

    shelterDemographics: {
      type: new GraphQLObjectType({
        name: 'ShelterDemographics',
        fields: {
          byType: { type: new GraphQLList(new GraphQLObjectType({
            name: 'DemographicBreakdown',
            fields: {
              category: { type: GraphQLString },
              count: { type: GraphQLInt },
              percentage: { type: GraphQLFloat },
            },
          }))},
          byBreed: { type: new GraphQLList(new GraphQLObjectType({
            name: 'BreedBreakdown',
            fields: {
              category: { type: GraphQLString },
              count: { type: GraphQLInt },
              percentage: { type: GraphQLFloat },
            },
          }))},
          byAge: { type: new GraphQLList(new GraphQLObjectType({
            name: 'AgeBreakdown',
            fields: {
              category: { type: GraphQLString },
              count: { type: GraphQLInt },
              percentage: { type: GraphQLFloat },
            },
          }))},
          byStatus: { type: new GraphQLList(new GraphQLObjectType({
            name: 'StatusBreakdown',
            fields: {
              category: { type: GraphQLString },
              count: { type: GraphQLInt },
              percentage: { type: GraphQLFloat },
            },
          }))},
          totalAnimals: { type: GraphQLInt },
        },
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const shelterId = args.shelterId as string;
        const AnimalModel = mongoose.model<AnimalDocument>('animal');
        const animals = await AnimalModel.find({ shelter: shelterId }).lean();
        const total = animals.length;
        if (total === 0) return { byType: [], byBreed: [], byAge: [], byStatus: [], totalAnimals: 0 };

        const groupBy = (field: string): { category: string; count: number; percentage: number }[] => {
          const counts: Record<string, number> = {};
          for (const a of animals) {
            const val = String((a as Record<string, unknown>)[field] || 'Unknown');
            counts[val] = (counts[val] || 0) + 1;
          }
          return Object.entries(counts)
            .map(([category, count]) => ({ category, count, percentage: count / total }))
            .sort((a, b) => b.count - a.count);
        };

        const ageGroups = animals.map(a => {
          const age = a.age || 0;
          if (age < 1) return 'Puppy/Kitten';
          if (age < 3) return 'Young';
          if (age < 7) return 'Adult';
          return 'Senior';
        });
        const ageCounts: Record<string, number> = {};
        for (const g of ageGroups) ageCounts[g] = (ageCounts[g] || 0) + 1;
        const byAge = Object.entries(ageCounts)
          .map(([category, count]) => ({ category, count, percentage: count / total }))
          .sort((a, b) => b.count - a.count);

        return {
          byType: groupBy('type'),
          byBreed: groupBy('breed'),
          byAge,
          byStatus: groupBy('status'),
          totalAnimals: total,
        };
      },
    },

    shelterLengthOfStay: {
      type: new GraphQLObjectType({
        name: 'ShelterLengthOfStay',
        fields: {
          averageDays: { type: GraphQLFloat },
          medianDays: { type: GraphQLFloat },
          distribution: { type: new GraphQLList(new GraphQLObjectType({
            name: 'LengthOfStayBucket',
            fields: {
              range: { type: GraphQLString },
              count: { type: GraphQLInt },
            },
          }))},
          longStayAlerts: { type: new GraphQLList(new GraphQLObjectType({
            name: 'LongStayAlert',
            fields: {
              animalId: { type: GraphQLID },
              name: { type: GraphQLString },
              days: { type: GraphQLInt },
              type: { type: GraphQLString },
            },
          }))},
          alertThresholdDays: { type: GraphQLInt },
        },
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        thresholdDays: { type: GraphQLInt },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const shelterId = args.shelterId as string;
        const threshold = (args.thresholdDays as number) || 90;
        const AnimalModel = mongoose.model<AnimalDocument>('animal');

        const animals = await AnimalModel.find({
          shelter: shelterId,
          status: { $in: ['available', 'hold', 'fostered'] },
        }).lean();

        const now = Date.now();
        const stayDays = animals.map(a => {
          const created = a._id.getTimestamp().getTime();
          return Math.floor((now - created) / 86400000);
        }).sort((a, b) => a - b);

        const avg = stayDays.length > 0 ? stayDays.reduce((s, d) => s + d, 0) / stayDays.length : 0;
        const median = stayDays.length > 0 ? stayDays[Math.floor(stayDays.length / 2)] : 0;

        const buckets = [
          { range: '0-7 days', min: 0, max: 7 },
          { range: '8-30 days', min: 8, max: 30 },
          { range: '31-90 days', min: 31, max: 90 },
          { range: '91-180 days', min: 91, max: 180 },
          { range: '180+ days', min: 181, max: Infinity },
        ];

        const distribution = buckets.map(b => ({
          range: b.range,
          count: stayDays.filter(d => d >= b.min && d <= b.max).length,
        }));

        const longStayAlerts = animals
          .filter(a => {
            const created = a._id.getTimestamp().getTime();
            return Math.floor((now - created) / 86400000) >= threshold;
          })
          .map(a => ({
            animalId: a._id.toString(),
            name: a.name,
            days: Math.floor((now - a._id.getTimestamp().getTime()) / 86400000),
            type: a.type,
          }))
          .sort((a, b) => b.days - a.days);

        return {
          averageDays: Math.round(avg * 10) / 10,
          medianDays: median,
          distribution,
          longStayAlerts,
          alertThresholdDays: threshold,
        };
      },
    },

    shelterKpiAlerts: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'KpiAlert',
        fields: {
          metric: { type: GraphQLString },
          currentValue: { type: GraphQLFloat },
          threshold: { type: GraphQLFloat },
          direction: { type: GraphQLString },
          severity: { type: GraphQLString },
          message: { type: GraphQLString },
        },
      })),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const shelterId = args.shelterId as string;
        const AnimalModel = mongoose.model<AnimalDocument>('animal');

        const total = await AnimalModel.countDocuments({ shelter: shelterId });
        const available = await AnimalModel.countDocuments({ shelter: shelterId, status: 'available' });
        const adopted = await AnimalModel.countDocuments({ shelter: shelterId, status: 'adopted' });

        const alerts: { metric: string; currentValue: number; threshold: number; direction: string; severity: string; message: string }[] = [];

        const adoptionRate = total > 0 ? adopted / total : 0;
        if (adoptionRate < 0.3) {
          alerts.push({
            metric: 'adoption_rate',
            currentValue: Math.round(adoptionRate * 100),
            threshold: 30,
            direction: 'below',
            severity: 'warning',
            message: `Adoption rate is ${Math.round(adoptionRate * 100)}%, below the 30% target`,
          });
        }

        if (available > 50) {
          alerts.push({
            metric: 'capacity',
            currentValue: available,
            threshold: 50,
            direction: 'above',
            severity: 'info',
            message: `${available} animals currently available, consider increasing outreach`,
          });
        }

        return alerts;
      },
    },

    shelterYearOverYear: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'YearOverYearData',
        fields: {
          year: { type: GraphQLInt },
          totalAdoptions: { type: GraphQLInt },
          totalIntakes: { type: GraphQLInt },
          averageLengthOfStay: { type: GraphQLFloat },
          returnRate: { type: GraphQLFloat },
        },
      })),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        years: { type: GraphQLInt },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const shelterId = args.shelterId as string;
        const yearCount = (args.years as number) || 3;
        const currentYear = new Date().getFullYear();
        const AnimalModel = mongoose.model<AnimalDocument>('animal');

        const results = [];
        for (let i = 0; i < yearCount; i++) {
          const year = currentYear - i;
          const start = new Date(year, 0, 1);
          const end = new Date(year, 11, 31, 23, 59, 59);

          const allAnimals = await AnimalModel.find({ shelter: shelterId }).lean();
          const yearAnimals = allAnimals.filter(a => {
            const ts = a._id.getTimestamp();
            return ts >= start && ts <= end;
          });

          const adopted = yearAnimals.filter(a => a.status === 'adopted').length;

          results.push({
            year,
            totalAdoptions: adopted,
            totalIntakes: yearAnimals.length,
            averageLengthOfStay: 0,
            returnRate: 0,
          });
        }

        return results.sort((a, b) => a.year - b.year);
      },
    },

    shelterExportReport: {
      type: new GraphQLObjectType({
        name: 'ShelterReport',
        fields: {
          shelterName: { type: GraphQLString },
          generatedAt: { type: GraphQLString },
          periodStart: { type: GraphQLString },
          periodEnd: { type: GraphQLString },
          totalAnimals: { type: GraphQLInt },
          totalAdoptions: { type: GraphQLInt },
          totalIntakes: { type: GraphQLInt },
          adoptionRate: { type: GraphQLFloat },
          averageLengthOfStay: { type: GraphQLFloat },
          animalsByType: { type: GraphQLString },
          animalsByStatus: { type: GraphQLString },
        },
      }),
      args: {
        shelterId: { type: new GraphQLNonNull(GraphQLID) },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const shelterId = args.shelterId as string;
        const ShelterModel = mongoose.model<ShelterDocument>('shelter');
        const AnimalModel = mongoose.model<AnimalDocument>('animal');

        const shelter = await ShelterModel.findById(shelterId).lean();
        const now = new Date();
        const start = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const end = args.endDate ? new Date(args.endDate as string) : now;

        const allAnimals = await AnimalModel.find({ shelter: shelterId }).lean();
        const reportAnimals = allAnimals.filter(a => {
          const ts = a._id.getTimestamp();
          return ts >= start && ts <= end;
        });

        const adopted = reportAnimals.filter(a => a.status === 'adopted').length;
        const typeCounts: Record<string, number> = {};
        const statusCounts: Record<string, number> = {};
        for (const a of reportAnimals) {
          typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
          statusCounts[a.status || 'unknown'] = (statusCounts[a.status || 'unknown'] || 0) + 1;
        }

        return {
          shelterName: shelter?.name || 'Unknown Shelter',
          generatedAt: now.toISOString(),
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          totalAnimals: reportAnimals.length,
          totalAdoptions: adopted,
          totalIntakes: reportAnimals.length,
          adoptionRate: reportAnimals.length > 0 ? adopted / reportAnimals.length : 0,
          averageLengthOfStay: 0,
          animalsByType: JSON.stringify(typeCounts),
          animalsByStatus: JSON.stringify(statusCounts),
        };
      },
    },

    // ── F9.2 Platform Analytics ──────────────────────────────────

    platformOverview: {
      type: new GraphQLObjectType({
        name: 'PlatformOverview',
        fields: {
          totalAnimals: { type: GraphQLInt },
          totalAdoptions: { type: GraphQLInt },
          totalUsers: { type: GraphQLInt },
          totalShelters: { type: GraphQLInt },
          totalApplications: { type: GraphQLInt },
          activeUsersLast30Days: { type: GraphQLInt },
          newUsersLast30Days: { type: GraphQLInt },
          availableAnimals: { type: GraphQLInt },
          averageApplicationsPerAnimal: { type: GraphQLFloat },
          platformAdoptionRate: { type: GraphQLFloat },
          generatedAt: { type: GraphQLString },
        },
      }),
      async resolve() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
          totalAnimals,
          adoptedAnimals,
          availableAnimals,
          totalUsers,
          totalShelters,
          totalApplications,
          activeSessions,
          newUsers,
        ] = await Promise.all([
          Animal.countDocuments({}),
          Animal.countDocuments({ status: 'adopted' }),
          Animal.countDocuments({ status: 'available' }),
          User.countDocuments({}),
          Shelter.countDocuments({}),
          Application.countDocuments({}),
          AuthSessionModel.countDocuments({ lastUsedAt: { $gte: thirtyDaysAgo }, revokedAt: { $exists: false } }),
          User.countDocuments({ date: { $gte: thirtyDaysAgo } }),
        ]);

        const avgApps = totalAnimals > 0 ? totalApplications / totalAnimals : 0;
        const adoptionRate = totalAnimals > 0 ? adoptedAnimals / totalAnimals : 0;

        return {
          totalAnimals,
          totalAdoptions: adoptedAnimals,
          totalUsers,
          totalShelters,
          totalApplications,
          activeUsersLast30Days: activeSessions,
          newUsersLast30Days: newUsers,
          availableAnimals,
          averageApplicationsPerAnimal: Math.round(avgApps * 100) / 100,
          platformAdoptionRate: Math.round(adoptionRate * 1000) / 1000,
          generatedAt: now.toISOString(),
        };
      },
    },

    platformConversionFunnel: {
      type: new GraphQLObjectType({
        name: 'PlatformConversionFunnel',
        fields: {
          periodStart: { type: GraphQLString },
          periodEnd: { type: GraphQLString },
          stages: { type: new GraphQLList(new GraphQLObjectType({
            name: 'FunnelStage',
            fields: {
              name: { type: GraphQLString },
              count: { type: GraphQLInt },
              conversionRate: { type: GraphQLFloat },
            },
          }))},
        },
      }),
      args: {
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = args.endDate ? new Date(args.endDate as string) : now;

        const dateFilter = { $gte: startDate, $lte: endDate };

        const [
          totalUsers,
          usersWithFavorites,
          drafts,
          submitted,
          approved,
          adopted,
        ] = await Promise.all([
          User.countDocuments({ date: dateFilter }),
          User.countDocuments({ date: dateFilter, 'favorites.0': { $exists: true } }),
          Application.countDocuments({ submittedAt: dateFilter, isDraft: true }),
          Application.countDocuments({ submittedAt: dateFilter, status: { $in: ['submitted', 'under_review', 'approved', 'rejected'] } }),
          Application.countDocuments({ submittedAt: dateFilter, status: 'approved' }),
          Animal.countDocuments({ status: 'adopted' }),
        ]);

        const baseCount = totalUsers || 1;
        const stages = [
          { name: 'registered', count: totalUsers, conversionRate: 1.0 },
          { name: 'favorited', count: usersWithFavorites, conversionRate: Math.round((usersWithFavorites / baseCount) * 1000) / 1000 },
          { name: 'started_application', count: drafts + submitted, conversionRate: Math.round(((drafts + submitted) / baseCount) * 1000) / 1000 },
          { name: 'submitted', count: submitted, conversionRate: Math.round((submitted / baseCount) * 1000) / 1000 },
          { name: 'approved', count: approved, conversionRate: Math.round((approved / baseCount) * 1000) / 1000 },
          { name: 'adopted', count: adopted, conversionRate: Math.round((adopted / baseCount) * 1000) / 1000 },
        ];

        return {
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
          stages,
        };
      },
    },

    platformEngagementMetrics: {
      type: new GraphQLObjectType({
        name: 'PlatformEngagementMetrics',
        fields: {
          periodStart: { type: GraphQLString },
          periodEnd: { type: GraphQLString },
          totalSessions: { type: GraphQLInt },
          uniqueUsers: { type: GraphQLInt },
          avgSessionsPerUser: { type: GraphQLFloat },
          returningUsers: { type: GraphQLInt },
          returningUserRate: { type: GraphQLFloat },
          dailyActiveUsers: { type: new GraphQLList(new GraphQLObjectType({
            name: 'DailyActiveUsers',
            fields: {
              date: { type: GraphQLString },
              count: { type: GraphQLInt },
            },
          }))},
        },
      }),
      args: {
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        const endDate = args.endDate ? new Date(args.endDate as string) : now;

        const sessions = await AuthSessionModel.find({
          createdAt: { $gte: startDate, $lte: endDate },
          revokedAt: { $exists: false },
        }).lean();

        const userSessionCounts: Record<string, number> = {};
        const dailyUsers: Record<string, Set<string>> = {};

        for (const s of sessions) {
          const uid = s.userId.toString();
          userSessionCounts[uid] = (userSessionCounts[uid] || 0) + 1;

          const dayKey = new Date(s.createdAt).toISOString().slice(0, 10);
          if (!dailyUsers[dayKey]) dailyUsers[dayKey] = new Set();
          dailyUsers[dayKey].add(uid);
        }

        const uniqueUsers = Object.keys(userSessionCounts).length;
        const returningUsers = Object.values(userSessionCounts).filter(c => c > 1).length;

        const dailyActiveUsers = Object.entries(dailyUsers)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, users]) => ({ date, count: users.size }));

        return {
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
          totalSessions: sessions.length,
          uniqueUsers,
          avgSessionsPerUser: uniqueUsers > 0 ? Math.round((sessions.length / uniqueUsers) * 100) / 100 : 0,
          returningUsers,
          returningUserRate: uniqueUsers > 0 ? Math.round((returningUsers / uniqueUsers) * 1000) / 1000 : 0,
          dailyActiveUsers,
        };
      },
    },

    platformGeographicActivity: {
      type: new GraphQLObjectType({
        name: 'PlatformGeographicActivity',
        fields: {
          regions: { type: new GraphQLList(new GraphQLObjectType({
            name: 'GeographicRegion',
            fields: {
              location: { type: GraphQLString },
              shelterCount: { type: GraphQLInt },
              animalCount: { type: GraphQLInt },
              adoptionCount: { type: GraphQLInt },
              latitude: { type: GraphQLFloat },
              longitude: { type: GraphQLFloat },
            },
          }))},
          totalRegions: { type: GraphQLInt },
        },
      }),
      async resolve() {
        const shelters = await Shelter.find({}).lean();
        const regionMap: Record<string, {
          location: string;
          shelterCount: number;
          animalIds: string[];
          lat: number;
          lng: number;
        }> = {};

        for (const s of shelters) {
          const loc = s.location || 'Unknown';
          if (!regionMap[loc]) {
            const coords = s.coordinates?.coordinates;
            regionMap[loc] = {
              location: loc,
              shelterCount: 0,
              animalIds: [],
              lat: coords?.[1] ?? 0,
              lng: coords?.[0] ?? 0,
            };
          }
          regionMap[loc].shelterCount++;
          const ids = (s.animals ?? []).map((id) => id.toString());
          regionMap[loc].animalIds.push(...ids);
        }

        const regions = await Promise.all(
          Object.values(regionMap).map(async (r) => {
            const animalCount = r.animalIds.length;
            let adoptionCount = 0;
            if (r.animalIds.length > 0) {
              adoptionCount = await Animal.countDocuments({
                _id: { $in: r.animalIds },
                status: 'adopted',
              });
            }
            return {
              location: r.location,
              shelterCount: r.shelterCount,
              animalCount,
              adoptionCount,
              latitude: r.lat,
              longitude: r.lng,
            };
          })
        );

        return { regions, totalRegions: regions.length };
      },
    },

    platformTrafficSources: {
      type: new GraphQLObjectType({
        name: 'PlatformTrafficSources',
        fields: {
          periodStart: { type: GraphQLString },
          periodEnd: { type: GraphQLString },
          sources: { type: new GraphQLList(new GraphQLObjectType({
            name: 'TrafficSource',
            fields: {
              platform: { type: GraphQLString },
              shares: { type: GraphQLInt },
              clicks: { type: GraphQLInt },
              applications: { type: GraphQLInt },
              conversionRate: { type: GraphQLFloat },
            },
          }))},
          totalShares: { type: GraphQLInt },
          totalClicks: { type: GraphQLInt },
        },
      }),
      args: {
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = args.endDate ? new Date(args.endDate as string) : now;

        const shareEvents = await ShareEventModel.find({
          createdAt: { $gte: startDate, $lte: endDate },
        }).lean();

        const platformMap: Record<string, { shares: number; clicks: number; applications: number }> = {};

        for (const evt of shareEvents) {
          if (!platformMap[evt.platform]) {
            platformMap[evt.platform] = { shares: 0, clicks: 0, applications: 0 };
          }
          platformMap[evt.platform].shares++;
          platformMap[evt.platform].clicks += evt.clickCount || 0;
          platformMap[evt.platform].applications += evt.applicationCount || 0;
        }

        let totalShares = 0;
        let totalClicks = 0;

        const sources = Object.entries(platformMap).map(([platform, data]) => {
          totalShares += data.shares;
          totalClicks += data.clicks;
          return {
            platform,
            ...data,
            conversionRate: data.clicks > 0 ? Math.round((data.applications / data.clicks) * 1000) / 1000 : 0,
          };
        });

        sources.sort((a, b) => b.clicks - a.clicks);

        return {
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
          sources,
          totalShares,
          totalClicks,
        };
      },
    },

    platformCohortAnalysis: {
      type: new GraphQLObjectType({
        name: 'PlatformCohortAnalysis',
        fields: {
          cohorts: { type: new GraphQLList(new GraphQLObjectType({
            name: 'UserCohort',
            fields: {
              cohortMonth: { type: GraphQLString },
              usersRegistered: { type: GraphQLInt },
              usersWithApplications: { type: GraphQLInt },
              usersAdopted: { type: GraphQLInt },
              retentionRate: { type: GraphQLFloat },
              applicationRate: { type: GraphQLFloat },
            },
          }))},
          totalCohorts: { type: GraphQLInt },
        },
      }),
      args: {
        months: { type: GraphQLInt },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const monthCount = Math.min((args.months as number) || 6, 24);
        const now = new Date();
        const cohorts: Array<{
          cohortMonth: string;
          usersRegistered: number;
          usersWithApplications: number;
          usersAdopted: number;
          retentionRate: number;
          applicationRate: number;
        }> = [];

        for (let i = monthCount - 1; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

          const users = await User.find({ date: { $gte: monthStart, $lte: monthEnd } }).lean();
          const userIds = users.map(u => u._id.toString());

          let usersWithApps = 0;
          let usersAdopted = 0;

          if (userIds.length > 0) {
            const appsForCohort = await Application.find({ userId: { $in: userIds } }).lean();
            const userIdsWithApps = new Set(appsForCohort.map(a => a.userId));
            usersWithApps = userIdsWithApps.size;

            const approvedApps = appsForCohort.filter(a => a.status === 'approved');
            const userIdsAdopted = new Set(approvedApps.map(a => a.userId));
            usersAdopted = userIdsAdopted.size;
          }

          const activeSessions = userIds.length > 0
            ? await AuthSessionModel.countDocuments({
                userId: { $in: userIds },
                lastUsedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
                revokedAt: { $exists: false },
              })
            : 0;

          const registered = users.length || 1;

          cohorts.push({
            cohortMonth: key,
            usersRegistered: users.length,
            usersWithApplications: usersWithApps,
            usersAdopted,
            retentionRate: Math.round((Math.min(activeSessions, users.length) / registered) * 1000) / 1000,
            applicationRate: Math.round((usersWithApps / registered) * 1000) / 1000,
          });
        }

        return { cohorts, totalCohorts: cohorts.length };
      },
    },

    platformAnalyticsExport: {
      type: new GraphQLObjectType({
        name: 'PlatformAnalyticsExport',
        fields: {
          format: { type: GraphQLString },
          data: { type: GraphQLString },
          generatedAt: { type: GraphQLString },
          recordCount: { type: GraphQLInt },
        },
      }),
      args: {
        format: { type: new GraphQLNonNull(GraphQLString) },
        dataType: { type: new GraphQLNonNull(GraphQLString) },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>, context: unknown) {
        const ctx = context as GraphQLContext;
        requireAuth(ctx);

        const format = args.format as string;
        const dataType = args.dataType as string;
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = args.endDate ? new Date(args.endDate as string) : now;

        type ExportRow = Record<string, string | number | boolean | null>;
        let rows: ExportRow[] = [];

        if (dataType === 'applications') {
          const apps = await Application.find({
            submittedAt: { $gte: startDate, $lte: endDate },
          }).lean();
          rows = apps.map(a => ({
            id: a._id.toString(),
            animalId: a.animalId,
            userId: a.userId,
            status: a.status ?? '',
            submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : '',
            isDraft: a.isDraft ?? false,
          }));
        } else if (dataType === 'animals') {
          const animals = await Animal.find({}).lean();
          const filtered = animals.filter(a => {
            const ts = a._id.getTimestamp();
            return ts >= startDate && ts <= endDate;
          });
          rows = filtered.map(a => ({
            id: a._id.toString(),
            name: a.name,
            type: a.type,
            breed: a.breed ?? '',
            status: a.status ?? '',
            age: a.age,
          }));
        } else if (dataType === 'users') {
          const users = await User.find({
            date: { $gte: startDate, $lte: endDate },
          }).select('-password -twoFactorSecret -twoFactorTempSecret -twoFactorBackupCodes -emailVerificationTokenHash -passwordResetTokenHash').lean();
          rows = users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.userRole,
            registeredAt: u.date ? new Date(u.date).toISOString() : '',
            emailVerified: u.emailVerified ?? false,
          }));
        } else if (dataType === 'shares') {
          const shares = await ShareEventModel.find({
            createdAt: { $gte: startDate, $lte: endDate },
          }).lean();
          rows = shares.map(s => ({
            id: s._id.toString(),
            entityType: s.entityType,
            entityId: s.entityId,
            platform: s.platform,
            clicks: s.clickCount,
            applications: s.applicationCount,
            createdAt: new Date(s.createdAt).toISOString(),
          }));
        }

        let data: string;
        if (format === 'csv') {
          if (rows.length === 0) {
            data = '';
          } else {
            const headers = Object.keys(rows[0]);
            const csvRows = rows.map(row =>
              headers.map(h => {
                const val = row[h];
                const str = val === null || val === undefined ? '' : String(val);
                return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
              }).join(',')
            );
            data = [headers.join(','), ...csvRows].join('\n');
          }
        } else {
          data = JSON.stringify(rows);
        }

        return {
          format,
          data,
          generatedAt: now.toISOString(),
          recordCount: rows.length,
        };
      },
    },

    platformUserGrowth: {
      type: new GraphQLObjectType({
        name: 'PlatformUserGrowth',
        fields: {
          months: { type: new GraphQLList(new GraphQLObjectType({
            name: 'UserGrowthMonth',
            fields: {
              month: { type: GraphQLString },
              newUsers: { type: GraphQLInt },
              totalUsers: { type: GraphQLInt },
              newShelters: { type: GraphQLInt },
              totalShelters: { type: GraphQLInt },
            },
          }))},
          growthRate: { type: GraphQLFloat },
        },
      }),
      args: {
        months: { type: GraphQLInt },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const monthCount = Math.min((args.months as number) || 12, 24);
        const now = new Date();
        const monthData: Array<{
          month: string;
          newUsers: number;
          totalUsers: number;
          newShelters: number;
          totalShelters: number;
        }> = [];

        for (let i = monthCount - 1; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

          const [newUsers, totalUsers, totalShelters] = await Promise.all([
            User.countDocuments({ date: { $gte: monthStart, $lte: monthEnd } }),
            User.countDocuments({ date: { $lte: monthEnd } }),
            Shelter.countDocuments({}),
          ]);

          // Shelters don't have a timestamp field, estimate new shelters from users with shelterId in this period
          const newShelterUsers = await User.countDocuments({
            date: { $gte: monthStart, $lte: monthEnd },
            shelterId: { $exists: true, $ne: null },
          });

          monthData.push({
            month: key,
            newUsers,
            totalUsers,
            newShelters: newShelterUsers,
            totalShelters,
          });
        }

        const first = monthData[0]?.totalUsers || 1;
        const last = monthData[monthData.length - 1]?.totalUsers || 0;
        const growthRate = Math.round(((last - first) / first) * 1000) / 1000;

        return { months: monthData, growthRate };
      },
    },

    platformApplicationTrends: {
      type: new GraphQLObjectType({
        name: 'PlatformApplicationTrends',
        fields: {
          periodStart: { type: GraphQLString },
          periodEnd: { type: GraphQLString },
          totalSubmitted: { type: GraphQLInt },
          totalApproved: { type: GraphQLInt },
          totalRejected: { type: GraphQLInt },
          totalWithdrawn: { type: GraphQLInt },
          approvalRate: { type: GraphQLFloat },
          avgTimeToReviewDays: { type: GraphQLFloat },
          weeklyTrends: { type: new GraphQLList(new GraphQLObjectType({
            name: 'WeeklyApplicationTrend',
            fields: {
              week: { type: GraphQLString },
              submitted: { type: GraphQLInt },
              approved: { type: GraphQLInt },
              rejected: { type: GraphQLInt },
            },
          }))},
        },
      }),
      args: {
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(_root: unknown, args: Record<string, unknown>) {
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate as string) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const endDate = args.endDate ? new Date(args.endDate as string) : now;

        const apps = await Application.find({
          submittedAt: { $gte: startDate, $lte: endDate },
        }).lean();

        const submitted = apps.filter(a => !a.isDraft);
        const approved = submitted.filter(a => a.status === 'approved');
        const rejected = submitted.filter(a => a.status === 'rejected');
        const withdrawn = submitted.filter(a => a.status === 'withdrawn');

        // Calculate average review time for reviewed applications
        const reviewed = submitted.filter(a => a.reviewedAt && a.submittedAt);
        let avgReviewDays = 0;
        if (reviewed.length > 0) {
          const totalDays = reviewed.reduce((sum, a) => {
            const diff = new Date(a.reviewedAt as Date).getTime() - new Date(a.submittedAt as Date).getTime();
            return sum + diff / (1000 * 60 * 60 * 24);
          }, 0);
          avgReviewDays = Math.round((totalDays / reviewed.length) * 10) / 10;
        }

        // Build weekly trends
        const weekMap: Record<string, { submitted: number; approved: number; rejected: number }> = {};
        for (const a of submitted) {
          const d = new Date(a.submittedAt as Date);
          const weekStart = new Date(d);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const key = weekStart.toISOString().slice(0, 10);
          if (!weekMap[key]) weekMap[key] = { submitted: 0, approved: 0, rejected: 0 };
          weekMap[key].submitted++;
          if (a.status === 'approved') weekMap[key].approved++;
          if (a.status === 'rejected') weekMap[key].rejected++;
        }

        const weeklyTrends = Object.entries(weekMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([week, data]) => ({ week, ...data }));

        return {
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
          totalSubmitted: submitted.length,
          totalApproved: approved.length,
          totalRejected: rejected.length,
          totalWithdrawn: withdrawn.length,
          approvalRate: submitted.length > 0 ? Math.round((approved.length / submitted.length) * 1000) / 1000 : 0,
          avgTimeToReviewDays: avgReviewDays,
          weeklyTrends,
        };
      },
    },
  })
});

export default RootQueryType;
