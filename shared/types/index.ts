// Shared types for GraphQL schema - used by both backend and frontend

import { Types } from 'mongoose';

// User Types
export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  userRole: 'shelter' | 'endUser';
  paymentEmail?: string;
  password: string;
  date: Date;
  fbookId?: string;
  shelterId?: Types.ObjectId | string;
  varId?: Types.ObjectId | string;
}

export interface IUserDocument extends IUser {
  _doc?: IUser;
}

export interface UserAuthPayload {
  _id: string;
  name: string;
  email: string;
  token: string;
  loggedIn: boolean;
  userRole: string;
  shelter?: IShelter | null;
}

// Animal Types
export interface IAnimal {
  _id: Types.ObjectId | string;
  name: string;
  type: string;
  age: number;
  sex: string;
  color: string;
  description: string;
  image: string;
  video: string;
  applications: (Types.ObjectId | string)[];
}

export interface IAnimalDocument extends IAnimal {
  _doc?: IAnimal;
}

// Shelter Types
export interface IShelter {
  _id: Types.ObjectId | string;
  name: string;
  location: string;
  users: (Types.ObjectId | string)[];
  paymentEmail: string;
  animals: (Types.ObjectId | string)[];
}

export interface IShelterDocument extends IShelter {
  _doc?: IShelter;
}

// Application Types
export interface IApplication {
  _id: Types.ObjectId | string;
  animalId: string;
  userId: string;
  applicationData: string;
}

export interface IApplicationDocument extends IApplication {
  _doc?: IApplication;
}

// Authentication Types
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  userRole: string;
  shelterId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ValidationResult {
  message: string;
  isValid: boolean;
}

// GraphQL Resolver Context
export interface GraphQLContext {
  user?: IUser | null;
}

// Config Types
export interface Keys {
  MONGO_URI: string;
  secretOrKey: string;
  fbookKey: string;
  fbookClient: string;
  googClient: string;
  googkey: string;
}
