import { GraphQLObjectType, GraphQLInt } from 'graphql';

const PlatformStatsType = new GraphQLObjectType({
  name: 'PlatformStatsType',
  fields: () => ({
    totalUsers: { type: GraphQLInt },
    totalShelters: { type: GraphQLInt },
    totalAnimals: { type: GraphQLInt },
    totalApplications: { type: GraphQLInt },
    availableAnimals: { type: GraphQLInt },
    adoptedAnimals: { type: GraphQLInt },
    totalDonations: { type: GraphQLInt }
  })
});

export default PlatformStatsType;
