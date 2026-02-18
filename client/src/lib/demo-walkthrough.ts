// ── Demo Walkthrough System ───────────────────────────────────
// Interactive step-by-step guided tour for demo users

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for highlight element
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  page?: string;
}

export interface WalkthroughConfig {
  id: string;
  name: string;
  role: 'adopter' | 'shelter_staff' | 'shelter_admin' | 'all';
  steps: WalkthroughStep[];
}

export const WALKTHROUGHS: WalkthroughConfig[] = [
  {
    id: 'adopter-tour',
    name: 'Adopter Tour',
    role: 'adopter',
    steps: [
      { id: 'welcome', title: 'Welcome to Save A Stray!', description: 'Find your perfect pet companion. Let us show you around.', target: '#app-header', position: 'bottom' },
      { id: 'browse', title: 'Browse Available Pets', description: 'View all available animals looking for forever homes.', target: '[data-tour="animal-grid"]', position: 'bottom', page: '/animals' },
      { id: 'filter', title: 'Filter & Search', description: 'Narrow down results by type, breed, age, and more.', target: '[data-tour="search-filters"]', position: 'right', page: '/animals' },
      { id: 'detail', title: 'View Pet Details', description: 'Click on any pet to see their full profile, photos, and personality.', target: '[data-tour="animal-card"]', position: 'bottom', action: 'click' },
      { id: 'favorite', title: 'Save Favorites', description: 'Click the heart icon to save pets you are interested in.', target: '[data-tour="favorite-btn"]', position: 'left' },
      { id: 'apply', title: 'Apply to Adopt', description: 'Ready to adopt? Fill out an application for your chosen pet.', target: '[data-tour="apply-btn"]', position: 'bottom' },
      { id: 'track', title: 'Track Your Applications', description: 'Check the status of your applications anytime.', target: '[data-tour="applications-link"]', position: 'bottom', page: '/applications' },
    ],
  },
  {
    id: 'shelter-tour',
    name: 'Shelter Staff Tour',
    role: 'shelter_staff',
    steps: [
      { id: 'dashboard', title: 'Shelter Dashboard', description: 'Your command center for managing the shelter.', target: '[data-tour="dashboard"]', position: 'bottom', page: '/shelter/dashboard' },
      { id: 'animals', title: 'Manage Animals', description: 'Add, edit, and track all animals in your shelter.', target: '[data-tour="animal-management"]', position: 'right' },
      { id: 'applications', title: 'Review Applications', description: 'View and process adoption applications.', target: '[data-tour="applications"]', position: 'bottom' },
      { id: 'analytics', title: 'View Analytics', description: 'Track adoption rates, application trends, and shelter performance.', target: '[data-tour="analytics"]', position: 'left' },
      { id: 'messaging', title: 'Messages', description: 'Communicate with adopters and other staff.', target: '[data-tour="messaging"]', position: 'bottom' },
    ],
  },
];

// ── Walkthrough State ─────────────────────────────────────────

const WALKTHROUGH_KEY = 'demo_walkthrough_state';

interface WalkthroughState {
  activeWalkthrough: string | null;
  currentStepIndex: number;
  completedWalkthroughs: string[];
  skippedWalkthroughs: string[];
}

function getState(): WalkthroughState {
  try {
    const data = localStorage.getItem(WALKTHROUGH_KEY);
    return data ? JSON.parse(data) : {
      activeWalkthrough: null,
      currentStepIndex: 0,
      completedWalkthroughs: [],
      skippedWalkthroughs: [],
    };
  } catch {
    return { activeWalkthrough: null, currentStepIndex: 0, completedWalkthroughs: [], skippedWalkthroughs: [] };
  }
}

function saveState(state: WalkthroughState): void {
  localStorage.setItem(WALKTHROUGH_KEY, JSON.stringify(state));
}

export function startWalkthrough(walkthroughId: string): WalkthroughStep | null {
  const config = WALKTHROUGHS.find(w => w.id === walkthroughId);
  if (!config || config.steps.length === 0) return null;

  const state = getState();
  state.activeWalkthrough = walkthroughId;
  state.currentStepIndex = 0;
  saveState(state);

  return config.steps[0];
}

export function nextStep(): WalkthroughStep | null {
  const state = getState();
  if (!state.activeWalkthrough) return null;

  const config = WALKTHROUGHS.find(w => w.id === state.activeWalkthrough);
  if (!config) return null;

  const nextIndex = state.currentStepIndex + 1;
  if (nextIndex >= config.steps.length) {
    state.completedWalkthroughs.push(state.activeWalkthrough);
    state.activeWalkthrough = null;
    state.currentStepIndex = 0;
    saveState(state);
    return null;
  }

  state.currentStepIndex = nextIndex;
  saveState(state);
  return config.steps[nextIndex];
}

export function previousStep(): WalkthroughStep | null {
  const state = getState();
  if (!state.activeWalkthrough) return null;

  const config = WALKTHROUGHS.find(w => w.id === state.activeWalkthrough);
  if (!config) return null;

  const prevIndex = Math.max(0, state.currentStepIndex - 1);
  state.currentStepIndex = prevIndex;
  saveState(state);
  return config.steps[prevIndex];
}

export function skipWalkthrough(): void {
  const state = getState();
  if (state.activeWalkthrough) {
    state.skippedWalkthroughs.push(state.activeWalkthrough);
    state.activeWalkthrough = null;
    state.currentStepIndex = 0;
    saveState(state);
  }
}

export function getCurrentStep(): WalkthroughStep | null {
  const state = getState();
  if (!state.activeWalkthrough) return null;

  const config = WALKTHROUGHS.find(w => w.id === state.activeWalkthrough);
  if (!config) return null;

  return config.steps[state.currentStepIndex] || null;
}

export function getProgress(): { current: number; total: number; percentage: number } {
  const state = getState();
  if (!state.activeWalkthrough) return { current: 0, total: 0, percentage: 0 };

  const config = WALKTHROUGHS.find(w => w.id === state.activeWalkthrough);
  if (!config) return { current: 0, total: 0, percentage: 0 };

  const current = state.currentStepIndex + 1;
  const total = config.steps.length;
  return { current, total, percentage: Math.round((current / total) * 100) };
}

export function isWalkthroughComplete(walkthroughId: string): boolean {
  return getState().completedWalkthroughs.includes(walkthroughId);
}

export function getWalkthroughsForRole(role: string): WalkthroughConfig[] {
  return WALKTHROUGHS.filter(w => w.role === role || w.role === 'all');
}

export function resetWalkthroughState(): void {
  localStorage.removeItem(WALKTHROUGH_KEY);
}

// ── Demo Analytics ────────────────────────────────────────────

const DEMO_ANALYTICS_KEY = 'demo_analytics';

interface DemoInteraction {
  feature: string;
  action: string;
  timestamp: string;
}

export function trackDemoInteraction(feature: string, action: string): void {
  try {
    const data = localStorage.getItem(DEMO_ANALYTICS_KEY);
    const interactions: DemoInteraction[] = data ? JSON.parse(data) : [];
    interactions.push({ feature, action, timestamp: new Date().toISOString() });
    if (interactions.length > 500) interactions.splice(0, interactions.length - 500);
    localStorage.setItem(DEMO_ANALYTICS_KEY, JSON.stringify(interactions));
  } catch {
    // Silent fail
  }
}

export function getDemoAnalytics(): {
  totalInteractions: number;
  featureBreakdown: Record<string, number>;
  mostUsedFeature: string | null;
  sessionDuration: number;
} {
  try {
    const data = localStorage.getItem(DEMO_ANALYTICS_KEY);
    const interactions: DemoInteraction[] = data ? JSON.parse(data) : [];
    if (interactions.length === 0) {
      return { totalInteractions: 0, featureBreakdown: {}, mostUsedFeature: null, sessionDuration: 0 };
    }

    const breakdown: Record<string, number> = {};
    for (const i of interactions) {
      breakdown[i.feature] = (breakdown[i.feature] || 0) + 1;
    }

    const mostUsed = Object.entries(breakdown).reduce(
      (max, [key, val]) => val > max[1] ? [key, val] : max,
      ['', 0] as [string, number]
    );

    const first = new Date(interactions[0].timestamp).getTime();
    const last = new Date(interactions[interactions.length - 1].timestamp).getTime();

    return {
      totalInteractions: interactions.length,
      featureBreakdown: breakdown,
      mostUsedFeature: mostUsed[0] || null,
      sessionDuration: Math.round((last - first) / 1000),
    };
  } catch {
    return { totalInteractions: 0, featureBreakdown: {}, mostUsedFeature: null, sessionDuration: 0 };
  }
}

export function clearDemoAnalytics(): void {
  localStorage.removeItem(DEMO_ANALYTICS_KEY);
}
