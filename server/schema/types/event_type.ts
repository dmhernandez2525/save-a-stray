import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';

const EventRegistrationType = new GraphQLObjectType({
  name: 'EventRegistrationType',
  fields: {
    userId: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    registeredAt: { type: GraphQLString },
    status: { type: GraphQLString },
  },
});

const EventReminderType = new GraphQLObjectType({
  name: 'EventReminderType',
  fields: {
    type: { type: GraphQLString },
    scheduledFor: { type: GraphQLString },
    sent: { type: GraphQLBoolean },
  },
});

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
    eventType: { type: GraphQLString },
    capacity: { type: GraphQLInt },
    registrations: { type: new GraphQLList(EventRegistrationType) },
    waitlist: { type: new GraphQLList(EventRegistrationType) },
    isVirtual: { type: GraphQLBoolean },
    virtualLink: { type: GraphQLString },
    virtualPlatform: { type: GraphQLString },
    featuredAnimalIds: { type: new GraphQLList(GraphQLString) },
    photos: { type: new GraphQLList(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
    isRecurring: { type: GraphQLBoolean },
    recurringPattern: { type: GraphQLString },
    recurringEndDate: { type: GraphQLString },
    parentEventId: { type: GraphQLString },
    reminders: { type: new GraphQLList(EventReminderType) },
    status: { type: GraphQLString },
    registrationCount: { type: GraphQLInt },
    attendanceCount: { type: GraphQLInt },
    applicationsGenerated: { type: GraphQLInt },
    slug: { type: GraphQLString },
    spotsRemaining: {
      type: GraphQLInt,
      resolve(parent: { capacity?: number; registrationCount?: number }) {
        if (!parent.capacity) return null;
        return Math.max(0, parent.capacity - (parent.registrationCount ?? 0));
      },
    },
    createdAt: { type: GraphQLString },
  })
});

export default EventType;
