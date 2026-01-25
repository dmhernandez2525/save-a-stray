import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';

const PaymentIntentType = new GraphQLObjectType({
  name: 'PaymentIntentType',
  fields: () => ({
    id: { type: GraphQLString },
    amount: { type: GraphQLInt },
    currency: { type: GraphQLString },
    status: { type: GraphQLString },
    description: { type: GraphQLString },
    clientSecret: { type: GraphQLString }
  })
});

export default PaymentIntentType;
