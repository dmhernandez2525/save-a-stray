import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFieldConfigMap,
} from 'graphql';

interface UploadSignatureParent {
  signature?: string;
  timestamp?: number;
  cloudName?: string;
  apiKey?: string;
  folder?: string;
}

const UploadSignatureType = new GraphQLObjectType({
  name: 'UploadSignatureType',
  fields: (): GraphQLFieldConfigMap<UploadSignatureParent, unknown> => ({
    signature: { type: GraphQLString },
    timestamp: { type: GraphQLInt },
    cloudName: { type: GraphQLString },
    apiKey: { type: GraphQLString },
    folder: { type: GraphQLString },
  }),
});

export default UploadSignatureType;
