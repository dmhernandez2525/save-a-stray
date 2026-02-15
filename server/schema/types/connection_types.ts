import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Pagination metadata for cursor-based connections.',
  fields: {
    endCursor: {
      type: GraphQLString,
      description: 'Opaque cursor for the last item in the returned page.',
    },
    hasNextPage: {
      type: GraphQLBoolean,
      description: 'Whether another page exists after endCursor.',
    },
  },
});

const AnimalEdgeType = new GraphQLObjectType({
  name: 'AnimalEdge',
  description: 'A single edge in an animal connection.',
  fields: () => ({
    cursor: {
      type: GraphQLString,
      description: 'Opaque cursor for this edge.',
    },
    node: {
      type: require('./animal_type').default,
      description: 'Animal record at this edge.',
    },
  }),
});

const ApplicationEdgeType = new GraphQLObjectType({
  name: 'ApplicationEdge',
  description: 'A single edge in an application connection.',
  fields: () => ({
    cursor: {
      type: GraphQLString,
      description: 'Opaque cursor for this edge.',
    },
    node: {
      type: require('./application_type').default,
      description: 'Application record at this edge.',
    },
  }),
});

export const AnimalConnectionType = new GraphQLObjectType({
  name: 'AnimalConnection',
  description: 'Cursor-based paginated animal results.',
  fields: {
    edges: {
      type: new GraphQLList(AnimalEdgeType),
      description: 'Connection edges for animals.',
    },
    pageInfo: {
      type: PageInfoType,
      description: 'Cursor pagination metadata.',
    },
    totalCount: {
      type: GraphQLInt,
      description: 'Total number of records matching the filter before cursor slicing.',
    },
  },
});

export const ApplicationConnectionType = new GraphQLObjectType({
  name: 'ApplicationConnection',
  description: 'Cursor-based paginated application results.',
  fields: {
    edges: {
      type: new GraphQLList(ApplicationEdgeType),
      description: 'Connection edges for applications.',
    },
    pageInfo: {
      type: PageInfoType,
      description: 'Cursor pagination metadata.',
    },
    totalCount: {
      type: GraphQLInt,
      description: 'Total number of records matching the filter before cursor slicing.',
    },
  },
});

export const CursorNodeType = new GraphQLObjectType({
  name: 'CursorNode',
  description: 'Basic cursor payload for diagnostics and tooling.',
  fields: {
    id: { type: GraphQLID },
    cursor: { type: GraphQLString },
  },
});
