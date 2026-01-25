import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLFieldConfigMap
} from 'graphql';
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
import { EventDocument } from '../../models/Event';
import { DonationDocument } from '../../models/Donation';
import { ApplicationDocument } from '../../models/Application';
import { AnimalDocument } from '../../models/Animal';
import { UserDocument } from '../../models/User';
import { ShelterDocument } from '../../models/Shelter';
import { SuccessStoryDocument } from '../../models/SuccessStory';
import { ReviewDocument } from '../../models/Review';

const Application = mongoose.model<ApplicationDocument>('application');
const Animal = mongoose.model<AnimalDocument>('animal');
const User = mongoose.model<UserDocument>('user');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const SuccessStoryModel = mongoose.model<SuccessStoryDocument>('successStory');
const ReviewModel = mongoose.model<ReviewDocument>('review');
const NotificationModel = mongoose.model<NotificationDocument>('notification');
const EventModel = mongoose.model<EventDocument>('event');
const DonationModel = mongoose.model<DonationDocument>('donation');

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
    platformStats: {
      type: PlatformStatsType,
      async resolve() {
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
    }
  })
});

export default RootQueryType;
