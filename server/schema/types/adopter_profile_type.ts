import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLFieldConfigMap,
} from 'graphql';

interface AdopterProfileParent {
  _id?: string;
  userId: string;
  housingType: string;
  hasYard: boolean;
  yardSize: string;
  activityLevel: string;
  hoursAwayPerDay: number;
  hasChildren: boolean;
  childrenAges: string;
  hasOtherPets: boolean;
  otherPetTypes: string[];
  experienceLevel: string;
  preferredSize: string[];
  preferredEnergyLevel: string[];
  preferredAge: string;
  preferredSpecies: string[];
  allergies: string;
  specialConsiderations: string;
  completedAt?: Date;
  updatedAt?: Date;
}

const AdopterProfileType = new GraphQLObjectType({
  name: 'AdopterProfileType',
  fields: (): GraphQLFieldConfigMap<AdopterProfileParent, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    housingType: { type: GraphQLString },
    hasYard: { type: GraphQLBoolean },
    yardSize: { type: GraphQLString },
    activityLevel: { type: GraphQLString },
    hoursAwayPerDay: { type: GraphQLInt },
    hasChildren: { type: GraphQLBoolean },
    childrenAges: { type: GraphQLString },
    hasOtherPets: { type: GraphQLBoolean },
    otherPetTypes: { type: new GraphQLList(GraphQLString) },
    experienceLevel: { type: GraphQLString },
    preferredSize: { type: new GraphQLList(GraphQLString) },
    preferredEnergyLevel: { type: new GraphQLList(GraphQLString) },
    preferredAge: { type: GraphQLString },
    preferredSpecies: { type: new GraphQLList(GraphQLString) },
    allergies: { type: GraphQLString },
    specialConsiderations: { type: GraphQLString },
    completedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.completedAt?.toISOString(); },
    },
    updatedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.updatedAt?.toISOString(); },
    },
  }),
});

export default AdopterProfileType;
