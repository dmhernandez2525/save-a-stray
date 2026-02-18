// ── Smart Notification System ─────────────────────────────────
// Personalized timing, fatigue prevention, channel selection, and re-engagement

// ── Notification Types ───────────────────────────────────────

export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  category: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: 'new-match', type: 'match', title: 'New Pet Match!', body: 'We found a pet that matches your preferences.', channels: ['email', 'push', 'in_app'], priority: 'high', category: 'matching' },
  { id: 'app-status', type: 'application', title: 'Application Update', body: 'Your adoption application status has changed.', channels: ['email', 'push', 'in_app'], priority: 'high', category: 'applications' },
  { id: 'app-received', type: 'application', title: 'Application Received', body: 'We received your adoption application.', channels: ['email', 'in_app'], priority: 'medium', category: 'applications' },
  { id: 'new-message', type: 'message', title: 'New Message', body: 'You have a new message from a shelter.', channels: ['push', 'in_app'], priority: 'medium', category: 'messaging' },
  { id: 'favorite-update', type: 'favorite', title: 'Favorite Pet Update', body: 'A pet you favorited has a status change.', channels: ['email', 'in_app'], priority: 'medium', category: 'favorites' },
  { id: 'saved-search', type: 'search', title: 'New Listing Alert', body: 'New animals match your saved search criteria.', channels: ['email'], priority: 'low', category: 'search' },
  { id: 'adoption-complete', type: 'milestone', title: 'Congratulations!', body: 'Your adoption has been finalized.', channels: ['email', 'push', 'in_app'], priority: 'critical', category: 'milestones' },
  { id: 'foster-reminder', type: 'foster', title: 'Foster Check-In', body: 'Time for a foster animal health check-in.', channels: ['email', 'push'], priority: 'medium', category: 'foster' },
  { id: 'shelter-app', type: 'shelter', title: 'New Application', body: 'A new adoption application has been submitted.', channels: ['email', 'push', 'in_app'], priority: 'high', category: 'shelter' },
  { id: 'event-reminder', type: 'event', title: 'Upcoming Event', body: 'You have an upcoming shelter event.', channels: ['email', 'push'], priority: 'medium', category: 'events' },
  { id: 'reengagement', type: 'reengagement', title: 'We Miss You!', body: 'New pets are waiting for their forever home.', channels: ['email'], priority: 'low', category: 'engagement' },
  { id: 'weekly-digest', type: 'digest', title: 'Your Weekly Pet Digest', body: "Here are this week's top matches and updates.", channels: ['email'], priority: 'low', category: 'digest' },
];

export function getTemplateById(id: string): NotificationTemplate | null {
  return NOTIFICATION_TEMPLATES.find(t => t.id === id) || null;
}

export function getTemplatesByCategory(category: string): NotificationTemplate[] {
  return NOTIFICATION_TEMPLATES.filter(t => t.category === category);
}

export function getNotificationCategories(): string[] {
  return [...new Set(NOTIFICATION_TEMPLATES.map(t => t.category))];
}

// ── User Preferences ─────────────────────────────────────────

export interface NotificationPreferences {
  enabled: boolean;
  channels: Record<NotificationChannel, boolean>;
  quietHoursStart: number;  // 0-23
  quietHoursEnd: number;    // 0-23
  digestFrequency: 'daily' | 'weekly' | 'never';
  mutedCategories: string[];
  maxPerDay: number;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  channels: { email: true, push: true, in_app: true, sms: false },
  quietHoursStart: 22,
  quietHoursEnd: 7,
  digestFrequency: 'weekly',
  mutedCategories: [],
  maxPerDay: 10,
};

export function isQuietHours(hour: number, prefs: NotificationPreferences): boolean {
  if (prefs.quietHoursStart <= prefs.quietHoursEnd) {
    return hour >= prefs.quietHoursStart && hour < prefs.quietHoursEnd;
  }
  // Wraps around midnight (e.g., 22-7)
  return hour >= prefs.quietHoursStart || hour < prefs.quietHoursEnd;
}

export function shouldSendNotification(
  template: NotificationTemplate,
  prefs: NotificationPreferences,
  currentHour: number,
  sentToday: number
): { send: boolean; reason: string; delayUntil?: number } {
  if (!prefs.enabled) return { send: false, reason: 'Notifications disabled' };

  // Critical always goes through
  if (template.priority === 'critical') return { send: true, reason: 'Critical priority' };

  if (prefs.mutedCategories.includes(template.category)) return { send: false, reason: 'Category muted' };

  if (sentToday >= prefs.maxPerDay) return { send: false, reason: 'Daily limit reached' };

  if (isQuietHours(currentHour, prefs)) {
    return { send: false, reason: 'Quiet hours', delayUntil: prefs.quietHoursEnd };
  }

  // Check if at least one of the template's channels is enabled
  const hasEnabledChannel = template.channels.some(ch => prefs.channels[ch]);
  if (!hasEnabledChannel) return { send: false, reason: 'No enabled channels for this notification' };

  return { send: true, reason: 'Allowed' };
}

// ── Optimal Channel Selection ────────────────────────────────

export interface ChannelEngagement {
  channel: NotificationChannel;
  openRate: number;
  clickRate: number;
  responseTime: number;  // minutes
}

// Engagement scoring weights (must sum to 100)
const OPEN_RATE_WEIGHT = 40;
const CLICK_RATE_WEIGHT = 40;
const RESPONSE_TIME_WEIGHT = 20;

export function selectBestChannel(
  template: NotificationTemplate,
  prefs: NotificationPreferences,
  engagement: ChannelEngagement[]
): NotificationChannel {
  const available = template.channels.filter(ch => prefs.channels[ch]);
  if (available.length === 0) return 'in_app'; // fallback

  // Score channels by engagement using weighted formula
  const scored = available.map(channel => {
    const stats = engagement.find(e => e.channel === channel);
    if (!stats) return { channel, score: 50 };
    const score = (stats.openRate * OPEN_RATE_WEIGHT) + (stats.clickRate * CLICK_RATE_WEIGHT) + ((100 - Math.min(stats.responseTime, 100)) * RESPONSE_TIME_WEIGHT);
    return { channel, score: Math.round(score / 100) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].channel;
}

// ── Fatigue Prevention ───────────────────────────────────────

export interface FatigueState {
  sentToday: number;
  sentThisWeek: number;
  lastSentAt: string | null;
  consecutiveDays: number;
}

export function checkFatigue(
  state: FatigueState,
  prefs: NotificationPreferences
): { fatigued: boolean; reason: string; suggestedDelay?: number } {
  if (state.sentToday >= prefs.maxPerDay) {
    return { fatigued: true, reason: 'Daily limit reached', suggestedDelay: 24 * 60 };
  }

  if (state.sentThisWeek >= prefs.maxPerDay * 5) {
    return { fatigued: true, reason: 'Weekly volume is high', suggestedDelay: 12 * 60 };
  }

  if (state.consecutiveDays >= 7) {
    return { fatigued: true, reason: 'Sent notifications 7 days straight; consider a break', suggestedDelay: 24 * 60 };
  }

  if (state.lastSentAt) {
    const minutesSinceLast = (Date.now() - new Date(state.lastSentAt).getTime()) / 60000;
    if (minutesSinceLast < 5) {
      return { fatigued: true, reason: 'Too soon after last notification', suggestedDelay: 5 };
    }
  }

  return { fatigued: false, reason: 'OK' };
}

// ── Re-engagement Campaigns ──────────────────────────────────

export interface ReengagementCandidate {
  userId: string;
  lastActiveAt: string;
  inactiveDays: number;
  previousFavorites: number;
  previousApplications: number;
}

export function identifyReengagementCandidates(
  users: { userId: string; lastActiveAt: string; favoriteCount: number; applicationCount: number }[],
  inactiveThreshold: number = 14
): ReengagementCandidate[] {
  const now = Date.now();
  return users
    .map(user => {
      const inactiveDays = Math.max(0, Math.floor((now - new Date(user.lastActiveAt).getTime()) / (86400000)));
      return {
        userId: user.userId,
        lastActiveAt: user.lastActiveAt,
        inactiveDays,
        previousFavorites: user.favoriteCount,
        previousApplications: user.applicationCount,
      };
    })
    .filter(u => u.inactiveDays >= inactiveThreshold)
    .sort((a, b) => {
      // Prioritize users who were more engaged before going inactive
      const aEngagement = a.previousFavorites + a.previousApplications * 3;
      const bEngagement = b.previousFavorites + b.previousApplications * 3;
      return bEngagement - aEngagement;
    });
}

export function generateReengagementMessage(candidate: ReengagementCandidate): string {
  if (candidate.previousApplications > 0) {
    return 'New pets similar to the ones you applied for are waiting for their forever home!';
  }
  if (candidate.previousFavorites > 0) {
    return 'Some of the pets you saved are still looking for a loving home. Come take another look!';
  }
  return 'Discover new pets available for adoption near you.';
}

// ── Notification Effectiveness Analytics ─────────────────────

export interface NotificationMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
}

export function calculateEffectiveness(metrics: NotificationMetrics): {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
} {
  const deliveryRate = metrics.sent > 0 ? Math.round((metrics.delivered / metrics.sent) * 100) : 0;
  const openRate = metrics.delivered > 0 ? Math.round((metrics.opened / metrics.delivered) * 100) : 0;
  const clickRate = metrics.delivered > 0 ? Math.round((metrics.clicked / metrics.delivered) * 100) : 0;
  const clickToOpenRate = metrics.opened > 0 ? Math.round((metrics.clicked / metrics.opened) * 100) : 0;
  const unsubscribeRate = metrics.sent > 0 ? Math.round((metrics.unsubscribed / metrics.sent) * 1000) / 10 : 0;

  return { deliveryRate, openRate, clickRate, clickToOpenRate, unsubscribeRate };
}

// ── Smart Digest ─────────────────────────────────────────────

export interface DigestItem {
  type: string;
  title: string;
  preview: string;
  timestamp: string;
  priority: NotificationPriority;
}

export function buildDigest(
  items: DigestItem[],
  maxItems: number = 10
): { items: DigestItem[]; totalCount: number; hasMore: boolean } {
  const sorted = [...items].sort((a, b) => {
    const priorityOrder: Record<NotificationPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const pDiff = (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
    if (pDiff !== 0) return pDiff;
    // Secondary sort by timestamp (newest first) for stability
    return b.timestamp.localeCompare(a.timestamp);
  });

  const selected = sorted.slice(0, maxItems);
  return { items: selected, totalCount: items.length, hasMore: items.length > maxItems };
}
