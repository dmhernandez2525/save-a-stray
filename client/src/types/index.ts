// Frontend Types for GraphQL and Apollo

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
  loggedIn?: boolean;
  userRole: 'shelter' | 'endUser';
  shelter?: Shelter;
}

// Animal Types
export type AnimalStatus = 'available' | 'pending' | 'adopted';

export interface MedicalRecord {
  _id?: string;
  date: string;
  recordType: string;
  description: string;
  veterinarian?: string;
}

export interface Animal {
  _id: string;
  name: string;
  type: string;
  age: number;
  breed?: string;
  sex: string;
  color: string;
  description: string;
  image: string;
  images?: string[];
  video: string;
  status: AnimalStatus;
  medicalRecords?: MedicalRecord[];
  applications?: Application[];
}

// Shelter Types
export interface Shelter {
  _id: string;
  name: string;
  location: string;
  paymentEmail: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  description?: string;
  verified?: boolean;
  verifiedAt?: string;
  animals?: Animal[];
  users?: User[];
}

// Application Types
export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface Application {
  _id: string;
  animalId: string;
  userId: string;
  applicationData: string;
  status: ApplicationStatus;
  submittedAt: string;
  animal?: Animal;
}

// GraphQL Query/Mutation Response Types
export interface LoginResponse {
  login: {
    token: string;
    loggedIn: boolean;
    _id: string;
  };
}

export interface RegisterResponse {
  register: {
    token: string;
    loggedIn: boolean;
    _id: string;
    shelter?: Shelter;
  };
}

export interface VerifyUserResponse {
  verifyUser: {
    loggedIn: boolean;
    _id: string;
  };
}

export interface FetchUserResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    userRole: string;
    shelter?: Shelter;
  };
}

export interface FetchShelterResponse {
  shelter: Shelter;
}

export interface ShelterApplicationsResponse {
  shelterApplications: Application[];
}

export interface UserApplicationsResponse {
  userApplications: Application[];
}

export interface FindAnimalsVariables {
  type?: string;
  breed?: string;
  sex?: string;
  color?: string;
  name?: string;
  status?: string;
  minAge?: number;
  maxAge?: number;
  limit?: number;
  offset?: number;
}

export interface FindAnimalsResponse {
  findAnimals: Animal[];
}

export interface FetchAnimalResponse {
  animal: Animal;
}

export interface SimilarAnimalsResponse {
  similarAnimals: Animal[];
}

export interface CreateAnimalResponse {
  newAnimal: Animal;
}

export interface CreateApplicationResponse {
  newApplication: Application;
}

export interface CreateShelterResponse {
  newShelter: Shelter;
}

// Notification Types
export interface AppNotification {
  _id: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface UserNotificationsResponse {
  userNotifications: AppNotification[];
}

// Review Types
export interface Review {
  _id: string;
  userId: string;
  shelterId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ShelterReviewsResponse {
  shelterReviews: Review[];
}

// Success Story Types
export interface SuccessStory {
  _id: string;
  userId: string;
  animalName: string;
  animalType: string;
  title: string;
  story: string;
  image?: string;
  createdAt: string;
}

export interface SuccessStoriesResponse {
  successStories: SuccessStory[];
}

export interface CreateSuccessStoryResponse {
  createSuccessStory: SuccessStory;
}

// Shelter Analytics Types
export interface ShelterAnalytics {
  totalAnimals: number;
  availableAnimals: number;
  pendingAnimals: number;
  adoptedAnimals: number;
  adoptionRate: number;
  totalApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  recentApplications: number;
}

export interface ShelterAnalyticsResponse {
  shelterAnalytics: ShelterAnalytics;
}

export interface ShelterStaffMember {
  _id: string;
  name: string;
  email: string;
}

export type ShelterEventType = 'adoption_day' | 'fundraiser' | 'volunteer' | 'education' | 'other';

export interface ShelterEvent {
  _id: string;
  shelterId: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  eventType: ShelterEventType;
}

export interface ShelterEventsResponse {
  shelterEvents: ShelterEvent[];
}

export interface Donation {
  _id: string;
  shelterId: string;
  userId?: string;
  donorName: string;
  amount: number;
  message: string;
  createdAt: string;
}

export interface ShelterDonationsResponse {
  shelterDonations: Donation[];
}

export interface PlatformStats {
  totalUsers: number;
  totalShelters: number;
  totalAnimals: number;
  totalApplications: number;
  availableAnimals: number;
  adoptedAnimals: number;
  totalDonations: number;
}

export interface PlatformStatsResponse {
  platformStats: PlatformStats;
}

export interface ShelterStaffResponse {
  shelterStaff: ShelterStaffMember[];
}

// Foster Types
export type FosterStatus = 'active' | 'completed' | 'cancelled';

export interface Foster {
  _id: string;
  shelterId: string;
  animalId: string;
  userId: string;
  fosterName: string;
  fosterEmail: string;
  startDate: string;
  endDate?: string;
  status: FosterStatus;
  notes: string;
  createdAt: string;
}

export interface ShelterFostersResponse {
  shelterFosters: Foster[];
}

// Saved Search Types
export interface SavedSearchFilters {
  type?: string;
  breed?: string;
  sex?: string;
  color?: string;
  status?: string;
  minAge?: number;
  maxAge?: number;
}

export interface SavedSearch {
  _id: string;
  userId: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
}

export interface UserSavedSearchesResponse {
  userSavedSearches: SavedSearch[];
}

// Activity Log Types
export type ActivityEntityType = 'animal' | 'application' | 'user' | 'shelter' | 'event' | 'donation';

export interface ActivityLogEntry {
  _id: string;
  shelterId: string;
  action: string;
  entityType: ActivityEntityType;
  entityId: string;
  description: string;
  createdAt: string;
}

export interface ShelterActivityLogResponse {
  shelterActivityLog: ActivityLogEntry[];
}

// Application Template Types
export type TemplateFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number';

export interface TemplateField {
  label: string;
  fieldType: TemplateFieldType;
  required: boolean;
  options: string[];
}

export interface ApplicationTemplate {
  _id: string;
  shelterId: string;
  name: string;
  fields: TemplateField[];
  createdAt: string;
}

export interface ShelterApplicationTemplatesResponse {
  shelterApplicationTemplates: ApplicationTemplate[];
}

// Local State Types
export interface IsLoggedInData {
  isLoggedIn: boolean;
}

export interface UserIdData {
  userId: string;
}

// Component Props Types
export interface WithRouterProps {
  history: {
    push: (path: string) => void;
    replace: (path: string) => void;
    goBack: () => void;
    goForward: () => void;
    location: {
      pathname: string;
    };
  };
  match: {
    params: Record<string, string>;
  };
  location: {
    pathname: string;
    search: string;
    hash: string;
  };
  navigate: (path: string | number, options?: { replace?: boolean }) => void;
  params: Record<string, string>;
}

// Form State Types
export interface LoginFormState {
  email: string;
  password: string;
}

export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  userRole: string;
  shelterName: string;
  shelterLocation: string;
  shelterPaymentEmail: string;
}

export interface AnimalFormState {
  name: string;
  type: string;
  age: string;
  sex: string;
  color: string;
  description: string;
  image: string;
  images: string[];
  video: string;
  application: string;
}

export interface ApplicationFormState {
  animalId: string;
  userId: string;
  applicationData: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  email: string;
  phoneNumber: string;
  housing: string;
  housingType: string;
  message: string;
  activityLevel: string;
}

export interface ShelterFormState {
  name: string;
  location: string;
  users: string;
  paymentEmail: string;
  animals: string;
}

// Terminal Reader Types
export type TerminalReaderStatus = 'online' | 'offline';

export interface TerminalReader {
  _id: string;
  shelterId: string;
  stripeReaderId: string;
  label: string;
  deviceType: string;
  serialNumber: string;
  location: string;
  status: TerminalReaderStatus;
  registeredAt: string;
}

export interface ShelterTerminalReadersResponse {
  shelterTerminalReaders: TerminalReader[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  clientSecret: string;
}
