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
    }
  })
});

export default RootQueryType;
