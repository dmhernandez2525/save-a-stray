// Native app configuration shared between platforms

export interface AppIconSpec {
  size: number;
  scale: number;
  platform: 'ios' | 'android' | 'both';
  filename: string;
  purpose: string;
}

export const APP_ICON_SPECS: AppIconSpec[] = [
  // iOS icons
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
  // Android icons
  { size: 48, scale: 1, platform: 'android', filename: 'mipmap-mdpi/ic_launcher.png', purpose: 'mdpi' },
  { size: 72, scale: 1, platform: 'android', filename: 'mipmap-hdpi/ic_launcher.png', purpose: 'hdpi' },
  { size: 96, scale: 1, platform: 'android', filename: 'mipmap-xhdpi/ic_launcher.png', purpose: 'xhdpi' },
  { size: 144, scale: 1, platform: 'android', filename: 'mipmap-xxhdpi/ic_launcher.png', purpose: 'xxhdpi' },
  { size: 192, scale: 1, platform: 'android', filename: 'mipmap-xxxhdpi/ic_launcher.png', purpose: 'xxxhdpi' },
  { size: 512, scale: 1, platform: 'android', filename: 'playstore-icon.png', purpose: 'Play Store' },
];

export interface SplashScreenSpec {
  width: number;
  height: number;
  platform: 'ios' | 'android';
  device: string;
}

export const SPLASH_SCREEN_SPECS: SplashScreenSpec[] = [
  { width: 750, height: 1334, platform: 'ios', device: 'iPhone 8' },
  { width: 1125, height: 2436, platform: 'ios', device: 'iPhone X/XS' },
  { width: 1242, height: 2688, platform: 'ios', device: 'iPhone XS Max' },
  { width: 1170, height: 2532, platform: 'ios', device: 'iPhone 12/13' },
  { width: 1290, height: 2796, platform: 'ios', device: 'iPhone 14 Pro Max' },
  { width: 2048, height: 2732, platform: 'ios', device: 'iPad Pro 12.9' },
  { width: 1080, height: 1920, platform: 'android', device: 'xxhdpi' },
  { width: 1440, height: 2560, platform: 'android', device: 'xxxhdpi' },
];

export interface ScreenshotSpec {
  width: number;
  height: number;
  platform: 'ios' | 'android';
  device: string;
  required: boolean;
}

export const SCREENSHOT_SPECS: ScreenshotSpec[] = [
  { width: 1290, height: 2796, platform: 'ios', device: 'iPhone 6.7"', required: true },
  { width: 1242, height: 2208, platform: 'ios', device: 'iPhone 5.5"', required: true },
  { width: 2048, height: 2732, platform: 'ios', device: 'iPad 12.9"', required: false },
  { width: 1080, height: 1920, platform: 'android', device: 'Phone', required: true },
  { width: 1920, height: 1080, platform: 'android', device: 'Tablet', required: false },
];

export const NAVIGATION_STRUCTURE = {
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
} as const;

export const CAMERA_CONFIG = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
  allowsEditing: true,
  mediaType: 'photo' as const,
  compressionFormat: 'jpeg' as const,
  maxFileSizeMB: 5,
};
