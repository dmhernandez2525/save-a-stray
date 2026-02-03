import { GraphQLSchema } from 'graphql';
import mutation from './mutations';
import query from './types/root_query_type';
import subscription from './types/root_subscription_type';

const schema = new GraphQLSchema({
  query,
  mutation,
  subscription
});

export default schema;
