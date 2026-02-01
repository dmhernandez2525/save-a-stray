// Demo users for different roles in the save-a-stray application
// These users are used when demo mode is enabled

import { User, Shelter } from '../types';
import { demoShelter } from './demoData';

export type DemoRole = 'adopter' | 'shelter_staff' | 'shelter_admin';

export interface DemoUser extends User {
  demoRole: DemoRole;
  displayName: string;
  description: string;
}

// Demo Shelter for staff/admin users
export const demoShelterData: Shelter = demoShelter;

// Demo Users by Role
export const demoUsers: Record<DemoRole, DemoUser> = {
  adopter: {
    _id: 'demo-user-adopter',
    name: 'Alex Thompson',
    email: 'alex.demo@example.com',
    userRole: 'endUser',
    token: 'demo-token-adopter',
    loggedIn: true,
    demoRole: 'adopter',
    displayName: 'Demo Adopter',
    description: 'Browse pets, submit applications, and explore the adoption process.',
  },
  shelter_staff: {
    _id: 'demo-user-staff',
    name: 'Jordan Rivera',
    email: 'jordan.demo@sunnypawsrescue.org',
    userRole: 'shelter',
    token: 'demo-token-staff',
    loggedIn: true,
    shelter: demoShelterData,
    demoRole: 'shelter_staff',
    displayName: 'Shelter Staff',
    description: 'Manage animals, process applications, and update pet profiles.',
  },
  shelter_admin: {
    _id: 'demo-user-admin',
    name: 'Morgan Chen',
    email: 'morgan.demo@sunnypawsrescue.org',
    userRole: 'shelter',
    token: 'demo-token-admin',
    loggedIn: true,
    shelter: demoShelterData,
    demoRole: 'shelter_admin',
    displayName: 'Shelter Admin',
    description: 'Full access: analytics, staff management, settings, and all shelter operations.',
  },
};

// Get demo user by role
export const getDemoUser = (role: DemoRole): DemoUser => {
  return demoUsers[role];
};

// Get all demo users as an array
export const getAllDemoUsers = (): DemoUser[] => {
  return Object.values(demoUsers);
};

// Role descriptions for the UI
export const roleDescriptions: Record<DemoRole, { title: string; features: string[] }> = {
  adopter: {
    title: 'Pet Adopter',
    features: [
      'Browse available pets',
      'View detailed pet profiles',
      'Submit adoption applications',
      'Track application status',
      'Save favorite pets',
    ],
  },
  shelter_staff: {
    title: 'Shelter Staff',
    features: [
      'Manage animal listings',
      'Update pet statuses',
      'Review applications',
      'Add medical records',
      'Track daily activities',
    ],
  },
  shelter_admin: {
    title: 'Shelter Administrator',
    features: [
      'Full staff access plus:',
      'View shelter analytics',
      'Manage staff members',
      'Configure shelter settings',
      'Track donations & volunteers',
    ],
  },
};
