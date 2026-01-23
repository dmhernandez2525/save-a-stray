import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt } from 'graphql';

const SavedSearchFiltersType = new GraphQLObjectType({
  name: 'SavedSearchFiltersType',
  fields: () => ({
    type: { type: GraphQLString },
    breed: { type: GraphQLString },
    sex: { type: GraphQLString },
    color: { type: GraphQLString },
    status: { type: GraphQLString },
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
    createdAt: { type: GraphQLString }
  })
});

export default SavedSearchType;
