import { Types } from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFieldConfigMap
} from 'graphql';
import { GraphQLContext } from '../../graphql/context';
import { filterLoaderResults } from '../../graphql/loaders';

interface UserParentValue {
  _id: string;
  varId?: string;
  name: string;
  email: string;
  token?: string;
  loggedIn?: boolean;
  userRole: string;
  shelterId?: string | Types.ObjectId;
  favorites?: Array<string | Types.ObjectId>;
}

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: "UserType",
  fields: (): GraphQLFieldConfigMap<UserParentValue, GraphQLContext> => ({
    _id: { type: GraphQLID },
    varId: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    // Token is only returned to the user themselves (during login/register)
    // and is null for other users to prevent token exposure
    token: {
      type: GraphQLString,
      resolve(parentValue: UserParentValue, _args, context: GraphQLContext) {
        // Only return token if:
        // 1. The token exists (it was just created during login/register)
        // 2. AND either:
        //    a. No user is authenticated yet (initial login response), or
        //    b. The authenticated user is requesting their own token
        if (!parentValue.token) return null;
        if (!context.userId || context.userId === parentValue._id.toString()) {
          return parentValue.token;
        }
        return null;
      }
    },
    loggedIn: { type: GraphQLBoolean },
    userRole: { type: GraphQLString },
    shelter: {
      type: require("./shelter_type").default,
      resolve(parentValue: UserParentValue, _args, context: GraphQLContext) {
        if (!parentValue.shelterId) return null;
        return context.loaders.shelterById.load(parentValue.shelterId.toString());
      }
    },
    favorites: {
      type: new GraphQLList(require("./animal_type").default),
      async resolve(parentValue: UserParentValue, _args, context: GraphQLContext) {
        const favoriteIds = parentValue.favorites?.map((id) => id.toString()) ?? [];
        if (favoriteIds.length === 0) return [];
        const results = await context.loaders.animalById.loadMany(favoriteIds);
        return filterLoaderResults(results);
      }
    },
    favoriteIds: {
      type: new GraphQLList(GraphQLID),
      resolve(parentValue: UserParentValue) {
        return parentValue.favorites || [];
      }
    }
  })
});

export default UserType;
