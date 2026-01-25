import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';

const AnnouncementType = new GraphQLObjectType({
  name: 'AnnouncementType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    category: { type: GraphQLString },
    author: { type: GraphQLString },
    pinned: { type: GraphQLBoolean },
    active: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString }
  })
});

export default AnnouncementType;
