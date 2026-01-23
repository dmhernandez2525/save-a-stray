import { GraphQLObjectType, GraphQLID, GraphQLString } from 'graphql';

const EventType = new GraphQLObjectType({
  name: 'EventType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    date: { type: GraphQLString },
    endDate: { type: GraphQLString },
    location: { type: GraphQLString },
    eventType: { type: GraphQLString }
  })
});

export default EventType;
