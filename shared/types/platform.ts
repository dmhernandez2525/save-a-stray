// Platform-agnostic types shared between web and native apps

export type Platform = 'web' | 'ios' | 'android';

export interface DeepLinkRoute {
  path: string;
  screen: string;
  paramMap: Record<string, string>;
}

export const DEEP_LINK_ROUTES: DeepLinkRoute[] = [
  { path: '/AnimalShow/:id', screen: 'AnimalDetail', paramMap: { id: 'animalId' } },
  { path: '/Shelter', screen: 'ShelterDashboard', paramMap: {} },
  { path: '/User', screen: 'Browse', paramMap: {} },
  { path: '/profile', screen: 'Profile', paramMap: {} },
  { path: '/settings', screen: 'Settings', paramMap: {} },
  { path: '/quiz', screen: 'CompatibilityQuiz', paramMap: {} },
  { path: '/success-stories', screen: 'SuccessStories', paramMap: {} },
  { path: '/login', screen: 'Login', paramMap: {} },
  { path: '/register', screen: 'Register', paramMap: {} },
  { path: '/', screen: 'Home', paramMap: {} },
];

export interface NativeScreenConfig {
  name: string;
  webPath: string;
  requiresAuth: boolean;
  headerTitle?: string;
}

export const SCREEN_REGISTRY: NativeScreenConfig[] = [
  { name: 'Home', webPath: '/', requiresAuth: false, headerTitle: 'Save A Stray' },
  { name: 'Browse', webPath: '/User', requiresAuth: true, headerTitle: 'Browse Pets' },
  { name: 'AnimalDetail', webPath: '/AnimalShow/:id', requiresAuth: false },
  { name: 'Login', webPath: '/login', requiresAuth: false, headerTitle: 'Sign In' },
  { name: 'Register', webPath: '/register', requiresAuth: false, headerTitle: 'Create Account' },
  { name: 'Profile', webPath: '/profile', requiresAuth: true, headerTitle: 'My Profile' },
  { name: 'Settings', webPath: '/settings', requiresAuth: true, headerTitle: 'Settings' },
  { name: 'ShelterDashboard', webPath: '/Shelter', requiresAuth: true, headerTitle: 'Shelter Dashboard' },
  { name: 'CompatibilityQuiz', webPath: '/quiz', requiresAuth: false, headerTitle: 'Match Quiz' },
  { name: 'SuccessStories', webPath: '/success-stories', requiresAuth: false, headerTitle: 'Success Stories' },
  { name: 'Application', webPath: '/newApplication', requiresAuth: true, headerTitle: 'Apply to Adopt' },
];

export function resolveDeepLink(url: string): { screen: string; params: Record<string, string> } | null {
  const parsed = new URL(url, 'https://saveastray.com');
  const pathname = parsed.pathname;

  for (const route of DEEP_LINK_ROUTES) {
    const pattern = route.path.replace(/:(\w+)/g, '([^/]+)');
    const match = pathname.match(new RegExp(`^${pattern}$`));

    if (match) {
      const paramNames = [...route.path.matchAll(/:(\w+)/g)].map(m => m[1]);
      const params: Record<string, string> = {};
      paramNames.forEach((name, i) => {
        const mappedName = route.paramMap[name] || name;
        params[mappedName] = match[i + 1];
      });
      return { screen: route.screen, params };
    }
  }

  return null;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    type: 'new_animal' | 'application_update' | 'message' | 'event_reminder' | 'general';
    deepLink?: string;
    animalId?: string;
    applicationId?: string;
    eventId?: string;
  };
  badge?: number;
  sound?: string;
  channelId?: string;
}

export const NOTIFICATION_CHANNELS = {
  adoptionUpdates: {
    id: 'adoption-updates',
    name: 'Adoption Updates',
    description: 'Updates on your adoption applications',
    importance: 'high' as const,
  },
  newAnimals: {
    id: 'new-animals',
    name: 'New Animals',
    description: 'Notifications when new animals match your preferences',
    importance: 'default' as const,
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    description: 'Messages from shelters and adopters',
    importance: 'high' as const,
  },
  events: {
    id: 'events',
    name: 'Events',
    description: 'Event reminders and updates',
    importance: 'default' as const,
  },
  general: {
    id: 'general',
    name: 'General',
    description: 'General platform notifications',
    importance: 'low' as const,
  },
} as const;

export interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  isForceUpdate: boolean;
  releaseNotes?: string;
  storeUrl: {
    ios: string;
    android: string;
  };
}

export function shouldForceUpdate(current: string, minimum: string): boolean {
  const parse = (v: string): number[] => v.split('.').map(Number);
  const curr = parse(current);
  const min = parse(minimum);

  for (let i = 0; i < 3; i++) {
    if ((curr[i] || 0) < (min[i] || 0)) return true;
    if ((curr[i] || 0) > (min[i] || 0)) return false;
  }
  return false;
}

export interface BiometricConfig {
  available: boolean;
  type: 'face-id' | 'fingerprint' | 'none';
  enabled: boolean;
}

export const APP_STORE_CONFIG = {
  ios: {
    bundleId: 'com.saveastray.app',
    teamId: '',
    appId: '',
  },
  android: {
    packageName: 'com.saveastray.app',
    sha256CertFingerprints: [],
  },
} as const;
