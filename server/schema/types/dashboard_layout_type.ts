import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfigMap,
} from 'graphql';

const DashboardWidgetType = new GraphQLObjectType({
  name: 'DashboardWidgetType',
  fields: (): GraphQLFieldConfigMap<{ widgetId: string; visible: boolean; sortOrder: number }, unknown> => ({
    widgetId: { type: GraphQLString },
    visible: { type: GraphQLBoolean },
    sortOrder: { type: GraphQLInt },
  }),
});

interface DashboardLayoutParent {
  _id?: string;
  userId?: string;
  shelterId?: string;
  widgets?: Array<{ widgetId: string; visible: boolean; sortOrder: number }>;
  updatedAt?: Date;
}

const DashboardLayoutType = new GraphQLObjectType({
  name: 'DashboardLayoutType',
  fields: (): GraphQLFieldConfigMap<DashboardLayoutParent, unknown> => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLString },
    shelterId: { type: GraphQLString },
    widgets: { type: new GraphQLList(DashboardWidgetType) },
    updatedAt: {
      type: GraphQLString,
      resolve(parent) {
        return parent.updatedAt?.toISOString();
      },
    },
  }),
});

export default DashboardLayoutType;
