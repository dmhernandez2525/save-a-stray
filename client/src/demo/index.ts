// Demo Mode - Export all demo-related components and utilities

// Context and Provider
export { DemoProvider, useDemo } from './DemoContext';
export type { default as DemoContextType } from './DemoContext';

// Demo Users and Roles
export { demoUsers, getDemoUser, getAllDemoUsers, roleDescriptions } from './demoUsers';
export type { DemoRole, DemoUser } from './demoUsers';

// Demo Data
export {
  demoShelter,
  demoAnimals,
  demoApplications,
  demoDonations,
  demoEvents,
  demoFosters,
  demoVolunteers,
  demoBehaviorNotes,
  demoAnnouncements,
  demoVaccinations,
  demoWeightRecords,
  demoIntakeLogs,
  demoActivityLog,
  demoAnalytics,
} from './demoData';

// Components
export { default as DemoBanner } from './DemoBanner';
export { default as DemoLanding } from './DemoLanding';
export { default as DemoRoleSelector } from './DemoRoleSelector';
export { default as DemoAdopterExperience } from './DemoAdopterExperience';
export { default as DemoShelterExperience } from './DemoShelterExperience';
