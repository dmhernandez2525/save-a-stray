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
import { paginationQueryFields } from './pagination_queries';
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
  })
});

export default RootQueryType;
