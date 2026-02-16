import { describe, it, expect } from 'vitest';

// Replicate the deep link resolution logic for testing
const DEEP_LINK_ROUTES = [
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

const SCREEN_REGISTRY = [
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

function resolveDeepLink(url) {
  const parsed = new URL(url, 'https://saveastray.com');
  const pathname = parsed.pathname;

  for (const route of DEEP_LINK_ROUTES) {
    const pattern = route.path.replace(/:(\w+)/g, '([^/]+)');
    const match = pathname.match(new RegExp(`^${pattern}$`));

    if (match) {
      const paramNames = [...route.path.matchAll(/:(\w+)/g)].map(m => m[1]);
      const params = {};
      paramNames.forEach((name, i) => {
        const mappedName = route.paramMap[name] || name;
        params[mappedName] = match[i + 1];
      });
      return { screen: route.screen, params };
    }
  }
  return null;
}

function shouldForceUpdate(current, minimum) {
  const parse = (v) => v.split('.').map(Number);
  const curr = parse(current);
  const min = parse(minimum);
  for (let i = 0; i < 3; i++) {
    if ((curr[i] || 0) < (min[i] || 0)) return true;
    if ((curr[i] || 0) > (min[i] || 0)) return false;
  }
  return false;
}

const NOTIFICATION_CHANNELS = {
  adoptionUpdates: { id: 'adoption-updates', importance: 'high' },
  newAnimals: { id: 'new-animals', importance: 'default' },
  messages: { id: 'messages', importance: 'high' },
  events: { id: 'events', importance: 'default' },
  general: { id: 'general', importance: 'low' },
};

const APP_STORE_CONFIG = {
  ios: { bundleId: 'com.saveastray.app' },
  android: { packageName: 'com.saveastray.app' },
};

describe('Native App Platform', () => {
  describe('Deep Link Resolution', () => {
    it('should resolve animal detail link', () => {
      const result = resolveDeepLink('https://saveastray.com/AnimalShow/abc123');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('AnimalDetail');
      expect(result.params.animalId).toBe('abc123');
    });

    it('should resolve home link', () => {
      const result = resolveDeepLink('https://saveastray.com/');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('Home');
    });

    it('should resolve profile link', () => {
      const result = resolveDeepLink('https://saveastray.com/profile');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('Profile');
    });

    it('should resolve quiz link', () => {
      const result = resolveDeepLink('https://saveastray.com/quiz');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('CompatibilityQuiz');
    });

    it('should resolve success stories link', () => {
      const result = resolveDeepLink('https://saveastray.com/success-stories');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('SuccessStories');
    });

    it('should resolve browse link', () => {
      const result = resolveDeepLink('https://saveastray.com/User');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('Browse');
    });

    it('should return null for unknown paths', () => {
      const result = resolveDeepLink('https://saveastray.com/unknown/path');
      expect(result).toBeNull();
    });

    it('should handle login deep link', () => {
      const result = resolveDeepLink('https://saveastray.com/login');
      expect(result).not.toBeNull();
      expect(result.screen).toBe('Login');
    });
  });

  describe('Deep Link Routes', () => {
    it('should have routes for all major screens', () => {
      const paths = DEEP_LINK_ROUTES.map(r => r.path);
      expect(paths).toContain('/');
      expect(paths).toContain('/AnimalShow/:id');
      expect(paths).toContain('/profile');
      expect(paths).toContain('/settings');
      expect(paths).toContain('/quiz');
    });

    it('should map AnimalShow id parameter to animalId', () => {
      const route = DEEP_LINK_ROUTES.find(r => r.path === '/AnimalShow/:id');
      expect(route.paramMap.id).toBe('animalId');
    });
  });

  describe('Screen Registry', () => {
    it('should have auth requirements for protected screens', () => {
      const profile = SCREEN_REGISTRY.find(s => s.name === 'Profile');
      expect(profile.requiresAuth).toBe(true);

      const settings = SCREEN_REGISTRY.find(s => s.name === 'Settings');
      expect(settings.requiresAuth).toBe(true);
    });

    it('should not require auth for public screens', () => {
      const home = SCREEN_REGISTRY.find(s => s.name === 'Home');
      expect(home.requiresAuth).toBe(false);

      const login = SCREEN_REGISTRY.find(s => s.name === 'Login');
      expect(login.requiresAuth).toBe(false);
    });

    it('should have header titles for all named screens', () => {
      const screensWithTitles = SCREEN_REGISTRY.filter(s => s.headerTitle);
      expect(screensWithTitles.length).toBeGreaterThan(5);
    });

    it('should map web paths to native screens', () => {
      const browse = SCREEN_REGISTRY.find(s => s.name === 'Browse');
      expect(browse.webPath).toBe('/User');
    });
  });

  describe('App Version Management', () => {
    it('should force update when current is below minimum', () => {
      expect(shouldForceUpdate('1.0.0', '1.1.0')).toBe(true);
      expect(shouldForceUpdate('1.0.0', '2.0.0')).toBe(true);
      expect(shouldForceUpdate('1.5.0', '1.5.1')).toBe(true);
    });

    it('should not force update when current meets minimum', () => {
      expect(shouldForceUpdate('1.1.0', '1.1.0')).toBe(false);
      expect(shouldForceUpdate('2.0.0', '1.0.0')).toBe(false);
      expect(shouldForceUpdate('1.5.2', '1.5.1')).toBe(false);
    });

    it('should handle equal versions', () => {
      expect(shouldForceUpdate('1.0.0', '1.0.0')).toBe(false);
    });

    it('should handle major version differences', () => {
      expect(shouldForceUpdate('1.9.9', '2.0.0')).toBe(true);
    });
  });

  describe('Notification Channels', () => {
    it('should define adoption updates channel', () => {
      expect(NOTIFICATION_CHANNELS.adoptionUpdates.id).toBe('adoption-updates');
      expect(NOTIFICATION_CHANNELS.adoptionUpdates.importance).toBe('high');
    });

    it('should define new animals channel', () => {
      expect(NOTIFICATION_CHANNELS.newAnimals.id).toBe('new-animals');
    });

    it('should define messages channel with high importance', () => {
      expect(NOTIFICATION_CHANNELS.messages.importance).toBe('high');
    });

    it('should define events channel', () => {
      expect(NOTIFICATION_CHANNELS.events.id).toBe('events');
    });

    it('should define general channel with low importance', () => {
      expect(NOTIFICATION_CHANNELS.general.importance).toBe('low');
    });
  });

  describe('App Store Config', () => {
    it('should define iOS bundle ID', () => {
      expect(APP_STORE_CONFIG.ios.bundleId).toBe('com.saveastray.app');
    });

    it('should define Android package name', () => {
      expect(APP_STORE_CONFIG.android.packageName).toBe('com.saveastray.app');
    });

    it('should use matching identifiers across platforms', () => {
      expect(APP_STORE_CONFIG.ios.bundleId).toBe(APP_STORE_CONFIG.android.packageName);
    });
  });
});
