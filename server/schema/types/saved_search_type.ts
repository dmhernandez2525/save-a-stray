import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLBoolean } from 'graphql';

const SavedSearchFiltersType = new GraphQLObjectType({
  name: 'SavedSearchFiltersType',
  fields: () => ({
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
    maxAge: { type: GraphQLInt }
  })
});

const SavedSearchType = new GraphQLObjectType({
  name: 'SavedSearchType',
  fields: () => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    name: { type: GraphQLString },
    filters: { type: SavedSearchFiltersType },
    alertsEnabled: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString }
  })
});

export default SavedSearchType;
