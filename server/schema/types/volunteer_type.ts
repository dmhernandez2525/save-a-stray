import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList } from 'graphql';

const VolunteerType = new GraphQLObjectType({
  name: 'VolunteerType',
  fields: () => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    userId: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    skills: { type: new GraphQLList(GraphQLString) },
    availability: { type: GraphQLString },
    status: { type: GraphQLString },
    startDate: { type: GraphQLString },
    totalHours: { type: GraphQLInt },
    notes: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default VolunteerType;
