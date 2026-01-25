import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFieldConfigMap
} from 'graphql';

interface SuccessStoryParentValue {
  _id: string;
  userId: string;
  animalName: string;
  animalType: string;
  title: string;
  story: string;
  image?: string;
  createdAt: string;
}

const SuccessStoryType: GraphQLObjectType = new GraphQLObjectType({
  name: "SuccessStoryType",
  fields: (): GraphQLFieldConfigMap<SuccessStoryParentValue, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    animalName: { type: GraphQLString },
    animalType: { type: GraphQLString },
    title: { type: GraphQLString },
    story: { type: GraphQLString },
    image: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

export default SuccessStoryType;
