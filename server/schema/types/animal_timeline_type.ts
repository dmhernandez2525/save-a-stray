import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap,
} from 'graphql';

interface TimelineEntryParent {
  _id?: string;
  eventType?: string;
  date?: string;
  title?: string;
  description?: string;
  author?: string;
}

const AnimalTimelineEntryType = new GraphQLObjectType({
  name: 'AnimalTimelineEntryType',
  fields: (): GraphQLFieldConfigMap<TimelineEntryParent, unknown> => ({
    _id: { type: GraphQLID },
    eventType: { type: GraphQLString },
    date: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    author: { type: GraphQLString },
  }),
});

export default AnimalTimelineEntryType;
