import { GraphQLSchema } from 'graphql';
import mutation from './mutations';
import query from './types/root_query_type';

const schema = new GraphQLSchema({
  query,
  mutation
});

export default schema;
