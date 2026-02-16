import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFieldConfigMap,
} from 'graphql';

interface MediaAssetParent {
  _id?: string;
  animalId?: string;
  shelterId?: string;
  publicId?: string;
  url?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  sortOrder?: number;
  viewCount?: number;
  createdAt?: Date;
}

const MediaAssetType = new GraphQLObjectType({
  name: 'MediaAssetType',
  fields: (): GraphQLFieldConfigMap<MediaAssetParent, unknown> => ({
    _id: { type: GraphQLID },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    publicId: { type: GraphQLString },
    url: { type: GraphQLString },
    thumbnailUrl: { type: GraphQLString },
    mediumUrl: { type: GraphQLString },
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
    mimeType: { type: GraphQLString },
    sizeBytes: { type: GraphQLInt },
    uploadedBy: { type: GraphQLString },
    sortOrder: { type: GraphQLInt },
    viewCount: { type: GraphQLInt },
    createdAt: {
      type: GraphQLString,
      resolve(parent) {
        return parent.createdAt?.toISOString();
      },
    },
  }),
});

export default MediaAssetType;
