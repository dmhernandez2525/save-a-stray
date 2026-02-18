import { describe, it, expect } from 'vitest';
import {
  NOTIFICATION_TEMPLATES, getTemplateById, getTemplatesByCategory, getNotificationCategories,
  DEFAULT_PREFERENCES, isQuietHours, shouldSendNotification,
  selectBestChannel,
  checkFatigue,
  identifyReengagementCandidates, generateReengagementMessage,
  calculateEffectiveness,
  buildDigest,
} from '../lib/smart-notifications';

describe('Smart Notifications', () => {

  describe('Notification Templates', () => {
    it('should define at least 10 templates', () => {
      expect(NOTIFICATION_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique IDs', () => {
      const ids = NOTIFICATION_TEMPLATES.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have valid priorities', () => {
      NOTIFICATION_TEMPLATES.forEach(t => {
        expect(['critical', 'high', 'medium', 'low']).toContain(t.priority);
      });
    });

    it('should have at least one channel per template', () => {
      NOTIFICATION_TEMPLATES.forEach(t => {
        expect(t.channels.length).toBeGreaterThan(0);
      });
    });

    it('should get template by ID', () => {
      const t = getTemplateById('new-match');
      expect(t).not.toBeNull();
      expect(t!.type).toBe('match');
    });

    it('should return null for unknown ID', () => {
      expect(getTemplateById('nonexistent')).toBeNull();
    });

    it('should get templates by category', () => {
      const apps = getTemplatesByCategory('applications');
      expect(apps.length).toBeGreaterThan(0);
      apps.forEach(t => expect(t.category).toBe('applications'));
    });

    it('should list all categories', () => {
      const cats = getNotificationCategories();
      expect(cats.length).toBeGreaterThan(5);
    });
  });

  describe('User Preferences', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_PREFERENCES.enabled).toBe(true);
      expect(DEFAULT_PREFERENCES.channels.email).toBe(true);
      expect(DEFAULT_PREFERENCES.channels.sms).toBe(false);
      expect(DEFAULT_PREFERENCES.maxPerDay).toBeGreaterThan(0);
    });

    it('should detect quiet hours (overnight)', () => {
      const prefs = { ...DEFAULT_PREFERENCES, quietHoursStart: 22, quietHoursEnd: 7 };
      expect(isQuietHours(23, prefs)).toBe(true);
      expect(isQuietHours(3, prefs)).toBe(true);
      expect(isQuietHours(10, prefs)).toBe(false);
    });

    it('should detect quiet hours (daytime)', () => {
      const prefs = { ...DEFAULT_PREFERENCES, quietHoursStart: 9, quietHoursEnd: 17 };
      expect(isQuietHours(12, prefs)).toBe(true);
      expect(isQuietHours(20, prefs)).toBe(false);
    });
  });

  describe('Send Decision', () => {
    const template = NOTIFICATION_TEMPLATES[0]; // new-match

    it('should allow notification when all conditions met', () => {
      const result = shouldSendNotification(template, DEFAULT_PREFERENCES, 10, 0);
      expect(result.send).toBe(true);
    });

    it('should block when notifications disabled', () => {
      const prefs = { ...DEFAULT_PREFERENCES, enabled: false };
      const result = shouldSendNotification(template, prefs, 10, 0);
      expect(result.send).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should block muted categories', () => {
      const prefs = { ...DEFAULT_PREFERENCES, mutedCategories: ['matching'] };
      const result = shouldSendNotification(template, prefs, 10, 0);
      expect(result.send).toBe(false);
    });

    it('should block during quiet hours', () => {
      const result = shouldSendNotification(template, DEFAULT_PREFERENCES, 23, 0);
      expect(result.send).toBe(false);
      expect(result.delayUntil).toBeDefined();
    });

    it('should always allow critical notifications', () => {
      const critical = NOTIFICATION_TEMPLATES.find(t => t.priority === 'critical');
      const prefs = { ...DEFAULT_PREFERENCES, mutedCategories: [critical!.category] };
      // Critical overrides muted categories
      const result = shouldSendNotification(critical!, prefs, 23, 100);
      expect(result.send).toBe(true);
    });

    it('should block when daily limit reached', () => {
      const result = shouldSendNotification(template, DEFAULT_PREFERENCES, 10, DEFAULT_PREFERENCES.maxPerDay);
      expect(result.send).toBe(false);
    });

    it('should block when no channels enabled', () => {
      const prefs = { ...DEFAULT_PREFERENCES, channels: { email: false, push: false, in_app: false, sms: false } };
      const result = shouldSendNotification(template, prefs, 10, 0);
      expect(result.send).toBe(false);
    });
  });

  describe('Channel Selection', () => {
    it('should select best channel based on engagement', () => {
      const engagement = [
        { channel: 'email', openRate: 50, clickRate: 10, responseTime: 120 },
        { channel: 'push', openRate: 80, clickRate: 30, responseTime: 5 },
        { channel: 'in_app', openRate: 60, clickRate: 20, responseTime: 30 },
      ];
      const template = NOTIFICATION_TEMPLATES[0];
      const best = selectBestChannel(template, DEFAULT_PREFERENCES, engagement);
      expect(best).toBe('push');
    });

    it('should respect disabled channels', () => {
      const prefs = { ...DEFAULT_PREFERENCES, channels: { email: true, push: false, in_app: false, sms: false } };
      const engagement = [{ channel: 'push', openRate: 90, clickRate: 50, responseTime: 1 }];
      const template = { ...NOTIFICATION_TEMPLATES[0], channels: ['email', 'push'] };
      const best = selectBestChannel(template, prefs, engagement);
      expect(best).toBe('email');
    });

    it('should fallback to in_app when no channels available', () => {
      const prefs = { ...DEFAULT_PREFERENCES, channels: { email: false, push: false, in_app: false, sms: false } };
      const best = selectBestChannel(NOTIFICATION_TEMPLATES[0], prefs, []);
      expect(best).toBe('in_app');
    });
  });

  describe('Fatigue Prevention', () => {
    it('should detect daily limit fatigue', () => {
      const result = checkFatigue(
        { sentToday: 10, sentThisWeek: 30, lastSentAt: null, consecutiveDays: 3 },
        DEFAULT_PREFERENCES
      );
      expect(result.fatigued).toBe(true);
      expect(result.reason).toContain('Daily limit');
    });

    it('should detect consecutive day fatigue', () => {
      const result = checkFatigue(
        { sentToday: 1, sentThisWeek: 20, lastSentAt: null, consecutiveDays: 7 },
        DEFAULT_PREFERENCES
      );
      expect(result.fatigued).toBe(true);
      expect(result.reason).toContain('7 days');
    });

    it('should detect too-frequent notifications', () => {
      const recent = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
      const result = checkFatigue(
        { sentToday: 1, sentThisWeek: 5, lastSentAt: recent, consecutiveDays: 1 },
        DEFAULT_PREFERENCES
      );
      expect(result.fatigued).toBe(true);
      expect(result.reason).toContain('Too soon');
    });

    it('should allow when not fatigued', () => {
      const old = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const result = checkFatigue(
        { sentToday: 2, sentThisWeek: 10, lastSentAt: old, consecutiveDays: 3 },
        DEFAULT_PREFERENCES
      );
      expect(result.fatigued).toBe(false);
    });
  });

  describe('Re-engagement', () => {
    const users = [
      { userId: 'u1', lastActiveAt: new Date(Date.now() - 30 * 86400000).toISOString(), favoriteCount: 5, applicationCount: 2 },
      { userId: 'u2', lastActiveAt: new Date(Date.now() - 20 * 86400000).toISOString(), favoriteCount: 3, applicationCount: 0 },
      { userId: 'u3', lastActiveAt: new Date(Date.now() - 5 * 86400000).toISOString(), favoriteCount: 10, applicationCount: 5 },
    ];

    it('should identify inactive users', () => {
      const candidates = identifyReengagementCandidates(users, 14);
      expect(candidates.length).toBe(2);
      expect(candidates.find(c => c.userId === 'u3')).toBeUndefined();
    });

    it('should prioritize more engaged users', () => {
      const candidates = identifyReengagementCandidates(users, 14);
      expect(candidates[0].userId).toBe('u1'); // had applications
    });

    it('should calculate inactive days', () => {
      const candidates = identifyReengagementCandidates(users, 14);
      expect(candidates[0].inactiveDays).toBeGreaterThanOrEqual(29);
    });

    it('should generate personalized messages', () => {
      const withApps = { userId: 'u1', lastActiveAt: '', inactiveDays: 30, previousFavorites: 5, previousApplications: 2 };
      expect(generateReengagementMessage(withApps)).toContain('applied');

      const withFavs = { userId: 'u2', lastActiveAt: '', inactiveDays: 20, previousFavorites: 3, previousApplications: 0 };
      expect(generateReengagementMessage(withFavs)).toContain('saved');

      const noActivity = { userId: 'u3', lastActiveAt: '', inactiveDays: 15, previousFavorites: 0, previousApplications: 0 };
      expect(generateReengagementMessage(noActivity)).toContain('Discover');
    });
  });

  describe('Effectiveness Analytics', () => {
    it('should calculate rates', () => {
      const result = calculateEffectiveness({
        sent: 1000, delivered: 950, opened: 300, clicked: 50, unsubscribed: 5,
      });
      expect(result.deliveryRate).toBe(95);
      expect(result.openRate).toBeGreaterThan(0);
      expect(result.clickRate).toBeGreaterThan(0);
      expect(result.clickToOpenRate).toBeGreaterThan(0);
    });

    it('should handle zero sent', () => {
      const result = calculateEffectiveness({ sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0 });
      expect(result.deliveryRate).toBe(0);
      expect(result.openRate).toBe(0);
    });

    it('should calculate unsubscribe rate', () => {
      const result = calculateEffectiveness({ sent: 1000, delivered: 900, opened: 300, clicked: 50, unsubscribed: 10 });
      expect(result.unsubscribeRate).toBe(1);
    });
  });

  describe('Smart Digest', () => {
    it('should sort by priority', () => {
      const items = [
        { type: 'search', title: 'Low', preview: 'x', timestamp: new Date().toISOString(), priority: 'low' },
        { type: 'app', title: 'High', preview: 'x', timestamp: new Date().toISOString(), priority: 'high' },
        { type: 'msg', title: 'Critical', preview: 'x', timestamp: new Date().toISOString(), priority: 'critical' },
      ];
      const digest = buildDigest(items);
      expect(digest.items[0].priority).toBe('critical');
      expect(digest.items[1].priority).toBe('high');
    });

    it('should limit items', () => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        type: 'test', title: `Item ${i}`, preview: 'x', timestamp: new Date().toISOString(), priority: 'medium',
      }));
      const digest = buildDigest(items, 5);
      expect(digest.items).toHaveLength(5);
      expect(digest.hasMore).toBe(true);
      expect(digest.totalCount).toBe(15);
    });

    it('should handle empty items', () => {
      const digest = buildDigest([]);
      expect(digest.items).toHaveLength(0);
      expect(digest.hasMore).toBe(false);
    });
  });
});
