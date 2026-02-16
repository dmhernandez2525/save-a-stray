import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFieldConfigMap
} from 'graphql';

interface SuccessStoryParentValue {
  _id: string;
  userId: string;
  animalName: string;
  animalType: string;
  animalId?: string;
  shelterId?: string;
  title: string;
  story: string;
  image?: string;
  images?: string[];
  imageCaptions?: string[];
  status?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  rejectionReason?: string;
  adoptionDate?: Date;
  reactions?: { heart: number; celebrate: number; inspiring: number };
  viewCount?: number;
  shareCount?: number;
  isFeatured?: boolean;
  featuredAt?: Date;
  slug?: string;
  createdAt: string;
}

const ReactionsType = new GraphQLObjectType({
  name: 'StoryReactionsType',
  fields: {
    heart: { type: GraphQLInt },
    celebrate: { type: GraphQLInt },
    inspiring: { type: GraphQLInt },
  },
});

const SuccessStoryType: GraphQLObjectType = new GraphQLObjectType({
  name: "SuccessStoryType",
  fields: (): GraphQLFieldConfigMap<SuccessStoryParentValue, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    animalName: { type: GraphQLString },
    animalType: { type: GraphQLString },
    animalId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    title: { type: GraphQLString },
    story: { type: GraphQLString },
    image: { type: GraphQLString },
    images: { type: new GraphQLList(GraphQLString) },
    imageCaptions: { type: new GraphQLList(GraphQLString) },
    status: { type: GraphQLString },
    moderatedBy: { type: GraphQLString },
    moderatedAt: { type: GraphQLString },
    rejectionReason: { type: GraphQLString },
    adoptionDate: { type: GraphQLString },
    reactions: { type: ReactionsType },
    viewCount: { type: GraphQLInt },
    shareCount: { type: GraphQLInt },
    isFeatured: { type: GraphQLBoolean },
    featuredAt: { type: GraphQLString },
    slug: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default SuccessStoryType;
