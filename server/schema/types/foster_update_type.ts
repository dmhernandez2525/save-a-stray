import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

interface FosterUpdateParent {
  _id?: string;
  placementId: string;
  fosterProfileId: string;
  userId: string;
  shelterId: string;
  animalId: string;
  type: string;
  date: Date;
  feeding: string;
  behavior: string;
  healthObservations: string;
  medications: string[];
  vetVisitDate?: Date;
  vetNotes: string;
  symptoms: string[];
  milestone: string;
  milestoneNotes: string;
  photoUrls: string[];
  videoUrls: string[];
  caption: string;
  visibleToAdopters: boolean;
  expenseAmount: number;
  expenseCategory: string;
  receiptUrl: string;
  expenseStatus: string;
  supplyItems: string[];
  supplyNotes: string;
  supplyStatus: string;
  notes: string;
  createdAt: Date;
}

const FosterUpdateType = new GraphQLObjectType({
  name: 'FosterUpdateType',
  fields: (): GraphQLFieldConfigMap<FosterUpdateParent, unknown> => ({
    _id: { type: GraphQLID },
    placementId: { type: GraphQLString },
    fosterProfileId: { type: GraphQLString },
    userId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    animalId: { type: GraphQLString },
    type: { type: GraphQLString },
    date: {
      type: GraphQLString,
      resolve(parent) { return parent.date?.toISOString(); },
    },
    feeding: { type: GraphQLString },
    behavior: { type: GraphQLString },
    healthObservations: { type: GraphQLString },
    medications: { type: new GraphQLList(GraphQLString) },
    vetVisitDate: {
      type: GraphQLString,
      resolve(parent) { return parent.vetVisitDate?.toISOString(); },
    },
    vetNotes: { type: GraphQLString },
    symptoms: { type: new GraphQLList(GraphQLString) },
    milestone: { type: GraphQLString },
    milestoneNotes: { type: GraphQLString },
    photoUrls: { type: new GraphQLList(GraphQLString) },
    videoUrls: { type: new GraphQLList(GraphQLString) },
    caption: { type: GraphQLString },
    visibleToAdopters: { type: GraphQLBoolean },
    expenseAmount: { type: GraphQLFloat },
    expenseCategory: { type: GraphQLString },
    receiptUrl: { type: GraphQLString },
    expenseStatus: { type: GraphQLString },
    supplyItems: { type: new GraphQLList(GraphQLString) },
    supplyNotes: { type: GraphQLString },
    supplyStatus: { type: GraphQLString },
    notes: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) { return parent.createdAt?.toISOString(); },
    },
  }),
});

export default FosterUpdateType;
