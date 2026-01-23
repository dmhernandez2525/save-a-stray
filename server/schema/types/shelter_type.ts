import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLFieldConfigMap
} from 'graphql';
import { ShelterDocument } from '../../models/Shelter';

const Shelter = mongoose.model<ShelterDocument>('shelter');

interface ShelterParentValue {
  _id: string;
  name: string;
  location: string;
  paymentEmail: string;
}

const ShelterType: GraphQLObjectType = new GraphQLObjectType({
  name: "ShelterType",
  fields: (): GraphQLFieldConfigMap<ShelterParentValue, unknown> => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    paymentEmail: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    website: { type: GraphQLString },
    hours: { type: GraphQLString },
    description: { type: GraphQLString },
    verified: { type: GraphQLBoolean },
    verifiedAt: { type: GraphQLString },
    animals: {
      type: new GraphQLList(require("./animal_type").default),
      resolve(parentValue: ShelterParentValue) {
        return Shelter.findById(parentValue._id).populate("animals").then(shelter => {
          return shelter?.animals || [];
        });
      }
    },
    users: {
      type: new GraphQLList(require("./user_type").default),
      resolve(parentValue: ShelterParentValue) {
        return Shelter.findById(parentValue._id).populate("users").then(shelter => {
          return shelter?.users || [];
        });
      }
    }
  })
});

export default ShelterType;
