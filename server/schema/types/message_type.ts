import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';

const MessageType = new GraphQLObjectType({
  name: 'MessageType',
  fields: () => ({
    _id: { type: GraphQLID },
    senderId: { type: GraphQLString },
    recipientId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    content: { type: GraphQLString },
    read: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString }
  })
});

export default MessageType;
