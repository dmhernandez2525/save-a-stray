import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';

interface DayScheduleParent {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface HolidayClosureParent {
  date: Date;
  reason: string;
}

interface AdoptionRequirementsParent {
  minAdopterAge: number;
  homeVisitRequired: boolean;
  referencesRequired: number;
  fenceRequired: boolean;
  landlordApproval: boolean;
}

interface NotificationPreferencesParent {
  newApplication: boolean;
  statusChange: boolean;
  capacityAlert: boolean;
  newMessage: boolean;
  volunteerSignup: boolean;
  donationReceived: boolean;
}

interface IntegrationConfigParent {
  enabled: boolean;
  apiKey: string;
}

interface ShelterSettingsParent {
  _id?: string;
  shelterId: string;
  logo: string;
  primaryColor: string;
  timezone: string;
  weeklySchedule: DayScheduleParent[];
  holidayClosures: HolidayClosureParent[];
  adoptionPolicy: string;
  adoptionRequirements: AdoptionRequirementsParent;
  notificationPreferences: NotificationPreferencesParent;
  integrations: Map<string, IntegrationConfigParent>;
  customCertificateTemplate: string;
  verificationDocuments: string[];
  updatedAt: Date;
}

const DayScheduleType = new GraphQLObjectType({
  name: 'DayScheduleType',
  fields: (): GraphQLFieldConfigMap<DayScheduleParent, unknown> => ({
    day: { type: GraphQLString },
    open: { type: GraphQLString },
    close: { type: GraphQLString },
    closed: { type: GraphQLBoolean },
  }),
});

const HolidayClosureType = new GraphQLObjectType({
  name: 'HolidayClosureType',
  fields: (): GraphQLFieldConfigMap<HolidayClosureParent, unknown> => ({
    date: {
      type: GraphQLString,
      resolve(parent) { return parent.date?.toISOString(); },
    },
    reason: { type: GraphQLString },
  }),
});

const AdoptionRequirementsType = new GraphQLObjectType({
  name: 'AdoptionRequirementsType',
  fields: (): GraphQLFieldConfigMap<AdoptionRequirementsParent, unknown> => ({
    minAdopterAge: { type: GraphQLInt },
    homeVisitRequired: { type: GraphQLBoolean },
    referencesRequired: { type: GraphQLInt },
    fenceRequired: { type: GraphQLBoolean },
    landlordApproval: { type: GraphQLBoolean },
  }),
});

const NotificationPreferencesType = new GraphQLObjectType({
  name: 'NotificationPreferencesType',
  fields: (): GraphQLFieldConfigMap<NotificationPreferencesParent, unknown> => ({
    newApplication: { type: GraphQLBoolean },
    statusChange: { type: GraphQLBoolean },
    capacityAlert: { type: GraphQLBoolean },
    newMessage: { type: GraphQLBoolean },
    volunteerSignup: { type: GraphQLBoolean },
    donationReceived: { type: GraphQLBoolean },
  }),
});

const IntegrationConfigType = new GraphQLObjectType({
  name: 'IntegrationConfigType',
  fields: () => ({
    name: { type: GraphQLString },
    enabled: { type: GraphQLBoolean },
    apiKey: { type: GraphQLString },
  }),
});

const ShelterSettingsType = new GraphQLObjectType({
  name: 'ShelterSettingsType',
  fields: (): GraphQLFieldConfigMap<ShelterSettingsParent, unknown> => ({
    _id: { type: GraphQLID },
    shelterId: { type: GraphQLString },
    logo: { type: GraphQLString },
    primaryColor: { type: GraphQLString },
    timezone: { type: GraphQLString },
    weeklySchedule: { type: new GraphQLList(DayScheduleType) },
    holidayClosures: { type: new GraphQLList(HolidayClosureType) },
    adoptionPolicy: { type: GraphQLString },
    adoptionRequirements: { type: AdoptionRequirementsType },
    notificationPreferences: { type: NotificationPreferencesType },
    integrations: {
      type: new GraphQLList(IntegrationConfigType),
      resolve(parent) {
        if (!parent.integrations) return [];
        const entries: Array<{ name: string; enabled: boolean; apiKey: string }> = [];
        if (parent.integrations instanceof Map) {
          parent.integrations.forEach((val, key) => {
            entries.push({ name: key, enabled: val.enabled, apiKey: val.apiKey });
          });
        }
        return entries;
      },
    },
    customCertificateTemplate: { type: GraphQLString },
    verificationDocuments: { type: new GraphQLList(GraphQLString) },
    updatedAt: {
      type: GraphQLString,
      resolve(parent) { return parent.updatedAt?.toISOString(); },
    },
  }),
});

// Input types for mutations
export const DayScheduleInput = new GraphQLInputObjectType({
  name: 'DayScheduleInput',
  fields: () => ({
    day: { type: GraphQLString },
    open: { type: GraphQLString },
    close: { type: GraphQLString },
    closed: { type: GraphQLBoolean },
  }),
});

export const HolidayClosureInput = new GraphQLInputObjectType({
  name: 'HolidayClosureInput',
  fields: () => ({
    date: { type: GraphQLString },
    reason: { type: GraphQLString },
  }),
});

export const AdoptionRequirementsInput = new GraphQLInputObjectType({
  name: 'AdoptionRequirementsInput',
  fields: () => ({
    minAdopterAge: { type: GraphQLInt },
    homeVisitRequired: { type: GraphQLBoolean },
    referencesRequired: { type: GraphQLInt },
    fenceRequired: { type: GraphQLBoolean },
    landlordApproval: { type: GraphQLBoolean },
  }),
});

export const NotificationPreferencesInput = new GraphQLInputObjectType({
  name: 'NotificationPreferencesInput',
  fields: () => ({
    newApplication: { type: GraphQLBoolean },
    statusChange: { type: GraphQLBoolean },
    capacityAlert: { type: GraphQLBoolean },
    newMessage: { type: GraphQLBoolean },
    volunteerSignup: { type: GraphQLBoolean },
    donationReceived: { type: GraphQLBoolean },
  }),
});

export default ShelterSettingsType;
