// Demo Context for managing demo mode state
// Environment-based demo mode: set VITE_DEMO_MODE=true to enable
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
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
} from "./demoData";
import { DemoRole, DemoUser, getDemoUser } from "./demoUsers";
import { isDemoMode } from "../config/env";
import {
  Animal,
  Shelter,
  Application,
  ApplicationStatus,
  Donation,
  ShelterEvent,
  Foster,
  Volunteer,
  BehaviorNote,
  Announcement,
  Vaccination,
  WeightRecord,
  IntakeLog,
  ActivityLogEntry,
  AnimalStatus,
  User,
} from "../types";

interface DemoContextType {
  // Environment check
  isDemoModeEnabled: boolean;

  // State
  isDemo: boolean;
  demoRole: "adopter" | "shelter";
  currentDemoUser: DemoUser | null;
  shelter: Shelter;
  animals: Animal[];
  applications: Application[];
  donations: Donation[];
  events: ShelterEvent[];
  fosters: Foster[];
  volunteers: Volunteer[];
  behaviorNotes: BehaviorNote[];
  announcements: Announcement[];
  vaccinations: Vaccination[];
  weightRecords: WeightRecord[];
  intakeLogs: IntakeLog[];
  activityLog: ActivityLogEntry[];
  analytics: typeof demoAnalytics;

  // Actions
  setDemoRole: (role: "adopter" | "shelter") => void;
  selectDemoUser: (role: DemoRole) => void;
  exitDemoMode: () => void;
  updateAnimalStatus: (animalId: string, status: AnimalStatus) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  addApplication: (application: Partial<Application>) => void;
  getAnimalById: (id: string) => Animal | undefined;
  getApplicationsForAnimal: (animalId: string) => Application[];
  filterAnimals: (filters: {
    type?: string;
    status?: string;
    sex?: string;
    minAge?: number;
    maxAge?: number;
    breed?: string;
    name?: string;
  }) => Animal[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const isDemoModeEnabled = isDemoMode();
  const [demoRole, setDemoRole] = useState<"adopter" | "shelter">("adopter");
  const [currentDemoUser, setCurrentDemoUser] = useState<DemoUser | null>(null);
  const [animals, setAnimals] = useState<Animal[]>(demoAnimals);
  const [applications, setApplications] = useState<Application[]>(demoApplications);

  // Select a demo user by role
  const selectDemoUser = useCallback((role: DemoRole) => {
    const user = getDemoUser(role);
    setCurrentDemoUser(user);
    // Map demo role to context role
    setDemoRole(role === "adopter" ? "adopter" : "shelter");
  }, []);

  // Exit demo mode - clear the demo user
  const exitDemoMode = useCallback(() => {
    setCurrentDemoUser(null);
    setDemoRole("adopter");
  }, []);

  const updateAnimalStatus = useCallback((animalId: string, status: AnimalStatus) => {
    setAnimals((prev) =>
      prev.map((animal) =>
        animal._id === animalId ? { ...animal, status } : animal
      )
    );
  }, []);

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: ApplicationStatus) => {
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    },
    []
  );

  const addApplication = useCallback((application: Partial<Application>) => {
    const newApplication: Application = {
      _id: `demo-app-${Date.now()}`,
      animalId: application.animalId || "",
      userId: "demo-visitor",
      applicationData: application.applicationData || "{}",
      status: "submitted",
      submittedAt: new Date().toISOString(),
      animal: animals.find((a) => a._id === application.animalId),
    };
    setApplications((prev) => [newApplication, ...prev]);
  }, [animals]);

  const getAnimalById = useCallback(
    (id: string) => animals.find((animal) => animal._id === id),
    [animals]
  );

  const getApplicationsForAnimal = useCallback(
    (animalId: string) =>
      applications.filter((app) => app.animalId === animalId),
    [applications]
  );

  const filterAnimals = useCallback(
    (filters: {
      type?: string;
      status?: string;
      sex?: string;
      minAge?: number;
      maxAge?: number;
      breed?: string;
      name?: string;
    }) => {
      return animals.filter((animal) => {
        if (filters.type && animal.type !== filters.type) return false;
        if (filters.status && animal.status !== filters.status) return false;
        if (filters.sex && animal.sex.toLowerCase() !== filters.sex.toLowerCase())
          return false;
        if (filters.minAge !== undefined && animal.age < filters.minAge)
          return false;
        if (filters.maxAge !== undefined && animal.age > filters.maxAge)
          return false;
        if (
          filters.breed &&
          !animal.breed?.toLowerCase().includes(filters.breed.toLowerCase())
        )
          return false;
        if (
          filters.name &&
          !animal.name.toLowerCase().includes(filters.name.toLowerCase())
        )
          return false;
        return true;
      });
    },
    [animals]
  );

  const value: DemoContextType = {
    isDemoModeEnabled,
    isDemo: currentDemoUser !== null,
    demoRole,
    currentDemoUser,
    shelter: demoShelter,
    animals,
    applications,
    donations: demoDonations,
    events: demoEvents,
    fosters: demoFosters,
    volunteers: demoVolunteers,
    behaviorNotes: demoBehaviorNotes,
    announcements: demoAnnouncements,
    vaccinations: demoVaccinations,
    weightRecords: demoWeightRecords,
    intakeLogs: demoIntakeLogs,
    activityLog: demoActivityLog,
    analytics: demoAnalytics,
    setDemoRole,
    selectDemoUser,
    exitDemoMode,
    updateAnimalStatus,
    updateApplicationStatus,
    addApplication,
    getAnimalById,
    getApplicationsForAnimal,
    filterAnimals,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
};

export default DemoContext;
