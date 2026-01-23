import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLFieldConfigMap
} from 'graphql';

interface ShelterAnalyticsParentValue {
  totalAnimals: number;
  availableAnimals: number;
  pendingAnimals: number;
  adoptedAnimals: number;
  adoptionRate: number;
  totalApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  recentApplications: number;
}

const ShelterAnalyticsType: GraphQLObjectType = new GraphQLObjectType({
  name: "ShelterAnalyticsType",
  fields: (): GraphQLFieldConfigMap<ShelterAnalyticsParentValue, unknown> => ({
    totalAnimals: { type: GraphQLInt },
    availableAnimals: { type: GraphQLInt },
    pendingAnimals: { type: GraphQLInt },
    adoptedAnimals: { type: GraphQLInt },
    adoptionRate: { type: GraphQLFloat },
    totalApplications: { type: GraphQLInt },
    submittedApplications: { type: GraphQLInt },
    underReviewApplications: { type: GraphQLInt },
    approvedApplications: { type: GraphQLInt },
    rejectedApplications: { type: GraphQLInt },
    recentApplications: { type: GraphQLInt }
  })
});

export default ShelterAnalyticsType;
