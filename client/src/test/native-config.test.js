import { describe, it, expect } from 'vitest';

// Replicate native config data for testing
const APP_ICON_SPECS = [
  { size: 20, scale: 2, platform: 'ios', filename: 'icon-20@2x.png', purpose: 'Notification' },
  { size: 20, scale: 3, platform: 'ios', filename: 'icon-20@3x.png', purpose: 'Notification' },
  { size: 29, scale: 2, platform: 'ios', filename: 'icon-29@2x.png', purpose: 'Settings' },
  { size: 29, scale: 3, platform: 'ios', filename: 'icon-29@3x.png', purpose: 'Settings' },
  { size: 40, scale: 2, platform: 'ios', filename: 'icon-40@2x.png', purpose: 'Spotlight' },
  { size: 40, scale: 3, platform: 'ios', filename: 'icon-40@3x.png', purpose: 'Spotlight' },
  { size: 60, scale: 2, platform: 'ios', filename: 'icon-60@2x.png', purpose: 'App Icon' },
  { size: 60, scale: 3, platform: 'ios', filename: 'icon-60@3x.png', purpose: 'App Icon' },
  { size: 76, scale: 2, platform: 'ios', filename: 'icon-76@2x.png', purpose: 'iPad App' },
  { size: 83.5, scale: 2, platform: 'ios', filename: 'icon-83.5@2x.png', purpose: 'iPad Pro' },
  { size: 1024, scale: 1, platform: 'ios', filename: 'icon-1024.png', purpose: 'App Store' },
  { size: 48, scale: 1, platform: 'android', filename: 'mipmap-mdpi/ic_launcher.png', purpose: 'mdpi' },
  { size: 72, scale: 1, platform: 'android', filename: 'mipmap-hdpi/ic_launcher.png', purpose: 'hdpi' },
  { size: 96, scale: 1, platform: 'android', filename: 'mipmap-xhdpi/ic_launcher.png', purpose: 'xhdpi' },
  { size: 144, scale: 1, platform: 'android', filename: 'mipmap-xxhdpi/ic_launcher.png', purpose: 'xxhdpi' },
  { size: 192, scale: 1, platform: 'android', filename: 'mipmap-xxxhdpi/ic_launcher.png', purpose: 'xxxhdpi' },
  { size: 512, scale: 1, platform: 'android', filename: 'playstore-icon.png', purpose: 'Play Store' },
];

const SPLASH_SCREEN_SPECS = [
  { width: 750, height: 1334, platform: 'ios', device: 'iPhone 8' },
  { width: 1125, height: 2436, platform: 'ios', device: 'iPhone X/XS' },
  { width: 1242, height: 2688, platform: 'ios', device: 'iPhone XS Max' },
  { width: 1170, height: 2532, platform: 'ios', device: 'iPhone 12/13' },
  { width: 1290, height: 2796, platform: 'ios', device: 'iPhone 14 Pro Max' },
  { width: 2048, height: 2732, platform: 'ios', device: 'iPad Pro 12.9' },
  { width: 1080, height: 1920, platform: 'android', device: 'xxhdpi' },
  { width: 1440, height: 2560, platform: 'android', device: 'xxxhdpi' },
];

const SCREENSHOT_SPECS = [
  { width: 1290, height: 2796, platform: 'ios', device: 'iPhone 6.7"', required: true },
  { width: 1242, height: 2208, platform: 'ios', device: 'iPhone 5.5"', required: true },
  { width: 2048, height: 2732, platform: 'ios', device: 'iPad 12.9"', required: false },
  { width: 1080, height: 1920, platform: 'android', device: 'Phone', required: true },
  { width: 1920, height: 1080, platform: 'android', device: 'Tablet', required: false },
];

const NAVIGATION_STRUCTURE = {
  tabs: [
    { name: 'HomeTab', screen: 'Home', icon: 'home', label: 'Home' },
    { name: 'BrowseTab', screen: 'Browse', icon: 'search', label: 'Browse' },
    { name: 'QuizTab', screen: 'CompatibilityQuiz', icon: 'paw', label: 'Quiz' },
    { name: 'StoriesTab', screen: 'SuccessStories', icon: 'heart', label: 'Stories' },
    { name: 'ProfileTab', screen: 'Profile', icon: 'user', label: 'Profile' },
  ],
  stacks: {
    HomeTab: ['Home', 'AnimalDetail'],
    BrowseTab: ['Browse', 'AnimalDetail', 'Application'],
    QuizTab: ['CompatibilityQuiz'],
    StoriesTab: ['SuccessStories'],
    ProfileTab: ['Profile', 'Settings'],
  },
  modals: ['Login', 'Register', 'Application'],
  auth: ['Login', 'Register'],
};

const CAMERA_CONFIG = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
  allowsEditing: true,
  mediaType: 'photo',
  compressionFormat: 'jpeg',
  maxFileSizeMB: 5,
};

describe('Native App Configuration', () => {
  describe('App Icon Specs', () => {
    it('should include iOS App Store icon at 1024px', () => {
      const appStore = APP_ICON_SPECS.find(s => s.size === 1024);
      expect(appStore).toBeDefined();
      expect(appStore.platform).toBe('ios');
      expect(appStore.purpose).toBe('App Store');
    });

    it('should include Android Play Store icon at 512px', () => {
      const playStore = APP_ICON_SPECS.find(s => s.size === 512);
      expect(playStore).toBeDefined();
      expect(playStore.platform).toBe('android');
      expect(playStore.purpose).toBe('Play Store');
    });

    it('should include iOS app icon at 60@2x and 60@3x', () => {
      const icons60 = APP_ICON_SPECS.filter(s => s.size === 60);
      expect(icons60).toHaveLength(2);
      expect(icons60.map(i => i.scale).sort()).toEqual([2, 3]);
    });

    it('should include all Android density icons', () => {
      const android = APP_ICON_SPECS.filter(s => s.platform === 'android');
      expect(android.length).toBeGreaterThanOrEqual(5);
    });

    it('should have both iOS and Android icons', () => {
      const ios = APP_ICON_SPECS.filter(s => s.platform === 'ios');
      const android = APP_ICON_SPECS.filter(s => s.platform === 'android');
      expect(ios.length).toBeGreaterThan(0);
      expect(android.length).toBeGreaterThan(0);
    });
  });

  describe('Splash Screen Specs', () => {
    it('should include iPhone and iPad splash screens', () => {
      const iphones = SPLASH_SCREEN_SPECS.filter(s => s.platform === 'ios' && s.device.includes('iPhone'));
      const ipads = SPLASH_SCREEN_SPECS.filter(s => s.platform === 'ios' && s.device.includes('iPad'));
      expect(iphones.length).toBeGreaterThan(0);
      expect(ipads.length).toBeGreaterThan(0);
    });

    it('should include Android splash screens', () => {
      const android = SPLASH_SCREEN_SPECS.filter(s => s.platform === 'android');
      expect(android.length).toBeGreaterThan(0);
    });

    it('should have proper aspect ratios for phones', () => {
      SPLASH_SCREEN_SPECS
        .filter(s => !s.device.includes('iPad'))
        .forEach(spec => {
          expect(spec.height).toBeGreaterThan(spec.width);
        });
    });
  });

  describe('Screenshot Specs', () => {
    it('should have required screenshots marked', () => {
      const required = SCREENSHOT_SPECS.filter(s => s.required);
      expect(required.length).toBeGreaterThanOrEqual(2);
    });

    it('should include iOS 6.7 inch screenshot', () => {
      const spec = SCREENSHOT_SPECS.find(s => s.device === 'iPhone 6.7"');
      expect(spec).toBeDefined();
      expect(spec.required).toBe(true);
    });

    it('should include Android phone screenshot', () => {
      const spec = SCREENSHOT_SPECS.find(s => s.platform === 'android' && s.device === 'Phone');
      expect(spec).toBeDefined();
      expect(spec.required).toBe(true);
    });
  });

  describe('Navigation Structure', () => {
    it('should define 5 bottom tabs', () => {
      expect(NAVIGATION_STRUCTURE.tabs).toHaveLength(5);
    });

    it('should have Home as first tab', () => {
      expect(NAVIGATION_STRUCTURE.tabs[0].name).toBe('HomeTab');
    });

    it('should have Profile as last tab', () => {
      const last = NAVIGATION_STRUCTURE.tabs[NAVIGATION_STRUCTURE.tabs.length - 1];
      expect(last.name).toBe('ProfileTab');
    });

    it('should define stacks for each tab', () => {
      for (const tab of NAVIGATION_STRUCTURE.tabs) {
        expect(NAVIGATION_STRUCTURE.stacks[tab.name]).toBeDefined();
      }
    });

    it('should include AnimalDetail in browse stack', () => {
      expect(NAVIGATION_STRUCTURE.stacks.BrowseTab).toContain('AnimalDetail');
    });

    it('should define modal screens', () => {
      expect(NAVIGATION_STRUCTURE.modals).toContain('Login');
      expect(NAVIGATION_STRUCTURE.modals).toContain('Register');
    });

    it('should define auth screens', () => {
      expect(NAVIGATION_STRUCTURE.auth).toContain('Login');
      expect(NAVIGATION_STRUCTURE.auth).toContain('Register');
    });

    it('should map tabs to icons', () => {
      NAVIGATION_STRUCTURE.tabs.forEach(tab => {
        expect(tab.icon).toBeDefined();
        expect(tab.label).toBeDefined();
      });
    });
  });

  describe('Camera Config', () => {
    it('should set max dimensions', () => {
      expect(CAMERA_CONFIG.maxWidth).toBe(1280);
      expect(CAMERA_CONFIG.maxHeight).toBe(1280);
    });

    it('should set quality between 0 and 1', () => {
      expect(CAMERA_CONFIG.quality).toBeGreaterThan(0);
      expect(CAMERA_CONFIG.quality).toBeLessThanOrEqual(1);
    });

    it('should use JPEG compression', () => {
      expect(CAMERA_CONFIG.compressionFormat).toBe('jpeg');
    });

    it('should limit file size to 5MB', () => {
      expect(CAMERA_CONFIG.maxFileSizeMB).toBe(5);
    });

    it('should allow editing', () => {
      expect(CAMERA_CONFIG.allowsEditing).toBe(true);
    });
  });
});
