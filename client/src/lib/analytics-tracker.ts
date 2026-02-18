/**
 * Platform analytics tracking for user behavior and conversion events.
 * Collects page views, searches, application funnels, and engagement data.
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

export interface SessionMetrics {
  sessionId: string;
  startedAt: number;
  pageViews: number;
  searches: number;
  animalViews: number;
  applicationStarts: number;
  favoriteToggles: number;
  lastActivityAt: number;
}

const SESSION_KEY = 'sas_analytics_session';
const EVENTS_KEY = 'sas_analytics_events';
const MAX_STORED_EVENTS = 500;

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSession(): SessionMetrics {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionMetrics;
      // Expire sessions after 30 minutes of inactivity
      if (Date.now() - parsed.lastActivityAt < 30 * 60 * 1000) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }

  const session: SessionMetrics = {
    sessionId: generateSessionId(),
    startedAt: Date.now(),
    pageViews: 0,
    searches: 0,
    animalViews: 0,
    applicationStarts: 0,
    favoriteToggles: 0,
    lastActivityAt: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function updateSession(updates: Partial<SessionMetrics>): SessionMetrics {
  const session = getSession();
  const updated = { ...session, ...updates, lastActivityAt: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

function storeEvent(event: AnalyticsEvent): void {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push(event);
    // Keep only the most recent events
    const trimmed = events.length > MAX_STORED_EVENTS
      ? events.slice(events.length - MAX_STORED_EVENTS)
      : events;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable
  }
}

export function trackEvent(category: string, action: string, label?: string, value?: number): void {
  const event: AnalyticsEvent = {
    category,
    action,
    label,
    value,
    timestamp: Date.now(),
  };
  storeEvent(event);
}

export function trackPageView(path: string): void {
  updateSession({ pageViews: getSession().pageViews + 1 });
  trackEvent('navigation', 'page_view', path);
}

export function trackSearch(query: string, resultCount: number): void {
  updateSession({ searches: getSession().searches + 1 });
  trackEvent('search', 'search_executed', query, resultCount);
}

export function trackAnimalView(animalId: string): void {
  updateSession({ animalViews: getSession().animalViews + 1 });
  trackEvent('animal', 'view', animalId);
}

export function trackApplicationStart(animalId: string): void {
  updateSession({ applicationStarts: getSession().applicationStarts + 1 });
  trackEvent('application', 'started', animalId);
}

export function trackApplicationSubmit(animalId: string): void {
  trackEvent('application', 'submitted', animalId);
}

export function trackFavoriteToggle(animalId: string, isFavorited: boolean): void {
  updateSession({ favoriteToggles: getSession().favoriteToggles + 1 });
  trackEvent('favorite', isFavorited ? 'added' : 'removed', animalId);
}

export function trackShare(platform: string, entityType: string, entityId: string): void {
  trackEvent('share', platform, `${entityType}:${entityId}`);
}

export function trackSignup(method: string): void {
  trackEvent('auth', 'signup', method);
}

export function trackLogin(method: string): void {
  trackEvent('auth', 'login', method);
}

export function getStoredEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSessionMetrics(): SessionMetrics {
  return getSession();
}

export function getSessionDuration(): number {
  const session = getSession();
  return session.lastActivityAt - session.startedAt;
}

export function clearStoredEvents(): void {
  localStorage.removeItem(EVENTS_KEY);
}

export function getEventsByCategory(category: string): AnalyticsEvent[] {
  return getStoredEvents().filter(e => e.category === category);
}

export function getEventSummary(): Record<string, number> {
  const events = getStoredEvents();
  const summary: Record<string, number> = {};
  for (const e of events) {
    const key = `${e.category}:${e.action}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  return summary;
}
