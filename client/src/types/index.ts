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
  video: string;
  status: AnimalStatus;
  applications?: Application[];
}

// Shelter Types
export interface Shelter {
  _id: string;
  name: string;
  location: string;
  paymentEmail: string;
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

export interface CreateAnimalResponse {
  newAnimal: Animal;
}

export interface CreateApplicationResponse {
  newApplication: Application;
}

export interface CreateShelterResponse {
  newShelter: Shelter;
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
}

export interface AnimalFormState {
  name: string;
  type: string;
  age: string;
  sex: string;
  color: string;
  description: string;
  image: string;
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

// Behavior Note Types
export type BehaviorNoteType = 'behavior' | 'training' | 'health' | 'general';
export type BehaviorNoteSeverity = 'info' | 'warning' | 'critical';

export interface BehaviorNote {
  _id: string;
  animalId: string;
  shelterId: string;
  noteType: BehaviorNoteType;
  content: string;
  author: string;
  severity: BehaviorNoteSeverity;
  resolved: boolean;
  createdAt: string;
}

export interface AnimalBehaviorNotesResponse {
  animalBehaviorNotes: BehaviorNote[];
}

export interface ShelterBehaviorNotesResponse {
  shelterBehaviorNotes: BehaviorNote[];
}
