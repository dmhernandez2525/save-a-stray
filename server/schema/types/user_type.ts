import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfigMap
} from 'graphql';
import { ShelterDocument } from '../../models/Shelter';
import { UserDocument } from '../../models/User';

const Shelter = mongoose.model<ShelterDocument>('shelter');

interface UserParentValue {
  _id: string;
  varId?: string;
  name: string;
  email: string;
  token?: string;
  loggedIn?: boolean;
  userRole: string;
  shelterId?: string;
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
    }
  })
});

export default UserType;
