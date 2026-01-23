import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFieldConfigMap
} from 'graphql';
import { ShelterDocument } from '../../models/Shelter';
import { UserDocument } from '../../models/User';
import { AnimalDocument } from '../../models/Animal';

const Shelter = mongoose.model<ShelterDocument>('shelter');
const Animal = mongoose.model<AnimalDocument>('animal');

interface UserParentValue {
  _id: string;
  varId?: string;
  name: string;
  email: string;
  token?: string;
  loggedIn?: boolean;
  userRole: string;
  shelterId?: string;
  favorites?: string[];
}

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: "UserType",
  fields: (): GraphQLFieldConfigMap<UserParentValue, unknown> => ({
    _id: { type: GraphQLID },
    varId: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    token: { type: GraphQLString },
    loggedIn: { type: GraphQLBoolean },
    userRole: { type: GraphQLString },
    shelter: {
      type: require("./shelter_type").default,
      resolve(parentValue: UserParentValue) {
        return Shelter.findById(parentValue.shelterId).then(shelter => {
          return shelter;
        });
      }
    },
    favorites: {
      type: new GraphQLList(require("./animal_type").default),
      resolve(parentValue: UserParentValue) {
        if (!parentValue.favorites || parentValue.favorites.length === 0) return [];
        return Animal.find({ _id: { $in: parentValue.favorites } });
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
