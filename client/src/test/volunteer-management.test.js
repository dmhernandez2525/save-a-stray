import { describe, it, expect } from 'vitest';
import {
  validateRegistration,
  createShift, signUpForShift, removeFromShift, detectScheduleConflict, getWeeklySchedule,
  TASK_CATEGORIES, assignTask, completeTask, getTasksByCategory, getOpenTasks, getVolunteerTasks,
  clockIn, clockOut, calculateHours, calculateTotalHours, getHoursByCategory, approveHours,
  BADGES, checkBadgeEligibility, buildLeaderboard,
  TRAINING_MODULES, getRequiredModules, isTrainingComplete, getTrainingStatus,
  initiateBackgroundCheck, reviewBackgroundCheck, isBackgroundCheckValid,
  calculateVolunteerAnalytics,
} from '../lib/volunteer-management';

describe('Volunteer Management', () => {

  describe('Registration', () => {
    const validData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      skills: ['animal-care'],
      availability: ['monday', 'wednesday'],
      emergencyContact: { name: 'John Doe', phone: '555-5678', relationship: 'Spouse' },
    };

    it('should accept valid registration', () => {
      const result = validateRegistration(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const result = validateRegistration({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid email', () => {
      const result = validateRegistration({ ...validData, email: 'not-an-email' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should reject empty skills array', () => {
      const result = validateRegistration({ ...validData, skills: [] });
      expect(result.valid).toBe(false);
    });

    it('should require emergency contact name', () => {
      const result = validateRegistration({
        ...validData,
        emergencyContact: { name: '', phone: '555-0000', relationship: 'Friend' },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Emergency contact name'))).toBe(true);
    });
  });

  describe('Shift Scheduling', () => {
    it('should create a shift with no volunteers', () => {
      const shift = createShift({
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 3, location: 'Main Shelter', notes: '',
      });
      expect(shift.assignedVolunteers).toHaveLength(0);
    });

    it('should allow sign-up', () => {
      const shift = createShift({
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 2, location: 'Main', notes: '',
      });
      const result = signUpForShift(shift, 'v1');
      expect(result.success).toBe(true);
      expect(result.shift.assignedVolunteers).toContain('v1');
      expect(shift.assignedVolunteers).toHaveLength(0); // original unchanged
    });

    it('should prevent double sign-up', () => {
      const shift = createShift({
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 3, location: 'Main', notes: '',
      });
      const first = signUpForShift(shift, 'v1');
      const result = signUpForShift(first.shift, 'v1');
      expect(result.success).toBe(false);
      expect(result.reason).toContain('Already');
    });

    it('should prevent sign-up when full', () => {
      const shift = createShift({
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 1, location: 'Main', notes: '',
      });
      const first = signUpForShift(shift, 'v1');
      const result = signUpForShift(first.shift, 'v2');
      expect(result.success).toBe(false);
      expect(result.reason).toContain('full');
    });

    it('should remove volunteer from shift', () => {
      const shift = createShift({
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 3, location: 'Main', notes: '',
      });
      const signed = signUpForShift(shift, 'v1');
      const result = removeFromShift(signed.shift, 'v1');
      expect(result.removed).toBe(true);
      expect(result.shift.assignedVolunteers).not.toContain('v1');
    });

    it('should detect schedule conflicts', () => {
      const existing = [{
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 3, assignedVolunteers: ['v1'],
        location: 'Main', notes: '',
      }];
      const newShift = {
        id: 's2', date: '2026-03-01', startTime: '10:00', endTime: '13:00',
        taskCategory: 'feeding', maxVolunteers: 2, assignedVolunteers: [],
        location: 'Main', notes: '',
      };
      const conflict = detectScheduleConflict(existing, 'v1', newShift);
      expect(conflict).not.toBeNull();
      expect(conflict.id).toBe('s1');
    });

    it('should not flag non-overlapping shifts', () => {
      const existing = [{
        id: 's1', date: '2026-03-01', startTime: '09:00', endTime: '12:00',
        taskCategory: 'walking', maxVolunteers: 3, assignedVolunteers: ['v1'],
        location: 'Main', notes: '',
      }];
      const newShift = {
        id: 's2', date: '2026-03-01', startTime: '13:00', endTime: '16:00',
        taskCategory: 'feeding', maxVolunteers: 2, assignedVolunteers: [],
        location: 'Main', notes: '',
      };
      expect(detectScheduleConflict(existing, 'v1', newShift)).toBeNull();
    });

    it('should build weekly schedule', () => {
      const shifts = [
        { id: 's1', date: '2026-03-02', startTime: '09:00', endTime: '12:00', taskCategory: 'walking', maxVolunteers: 3, assignedVolunteers: [], location: 'Main', notes: '' },
        { id: 's2', date: '2026-03-04', startTime: '09:00', endTime: '12:00', taskCategory: 'feeding', maxVolunteers: 2, assignedVolunteers: [], location: 'Main', notes: '' },
      ];
      const schedule = getWeeklySchedule(shifts, '2026-03-02');
      expect(schedule.monday).toHaveLength(1);
      expect(schedule.wednesday).toHaveLength(1);
      expect(schedule.friday).toHaveLength(0);
    });
  });

  describe('Task Assignment', () => {
    it('should have 8 task categories', () => {
      expect(TASK_CATEGORIES).toHaveLength(8);
    });

    it('should assign task to volunteer', () => {
      const task = { id: 't1', title: 'Walk dogs', category: 'walking', description: 'Walk 3 dogs', assignedTo: null, status: 'open', priority: 'medium', estimatedMinutes: 30 };
      const assigned = assignTask(task, 'v1');
      expect(assigned.assignedTo).toBe('v1');
      expect(assigned.status).toBe('assigned');
    });

    it('should complete task', () => {
      const task = { id: 't1', title: 'Walk dogs', category: 'walking', description: '', assignedTo: 'v1', status: 'assigned', priority: 'medium', estimatedMinutes: 30 };
      const completed = completeTask(task);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    it('should filter tasks by category', () => {
      const tasks = [
        { id: 't1', title: 'Walk', category: 'walking', description: '', assignedTo: null, status: 'open', priority: 'medium', estimatedMinutes: 30 },
        { id: 't2', title: 'Feed', category: 'feeding', description: '', assignedTo: null, status: 'open', priority: 'high', estimatedMinutes: 20 },
      ];
      expect(getTasksByCategory(tasks, 'walking')).toHaveLength(1);
    });

    it('should get open tasks', () => {
      const tasks = [
        { id: 't1', title: 'Walk', category: 'walking', description: '', assignedTo: null, status: 'open', priority: 'medium', estimatedMinutes: 30 },
        { id: 't2', title: 'Feed', category: 'feeding', description: '', assignedTo: 'v1', status: 'assigned', priority: 'high', estimatedMinutes: 20 },
      ];
      expect(getOpenTasks(tasks)).toHaveLength(1);
    });

    it('should get tasks for a volunteer', () => {
      const tasks = [
        { id: 't1', title: 'Walk', category: 'walking', description: '', assignedTo: 'v1', status: 'assigned', priority: 'medium', estimatedMinutes: 30 },
        { id: 't2', title: 'Feed', category: 'feeding', description: '', assignedTo: 'v2', status: 'assigned', priority: 'high', estimatedMinutes: 20 },
      ];
      expect(getVolunteerTasks(tasks, 'v1')).toHaveLength(1);
    });
  });

  describe('Hours Tracking', () => {
    it('should clock in', () => {
      const entry = clockIn('v1', 'walking', 'Morning walk');
      expect(entry.volunteerId).toBe('v1');
      expect(entry.clockIn).toBeTruthy();
      expect(entry.clockOut).toBeNull();
      expect(entry.approved).toBe(false);
    });

    it('should clock out', () => {
      const entry = clockIn('v1', 'walking');
      const updated = clockOut(entry);
      expect(updated.clockOut).toBeTruthy();
    });

    it('should calculate hours', () => {
      const entry = {
        id: 'h1', volunteerId: 'v1', date: '2026-03-01',
        clockIn: '2026-03-01T09:00:00Z', clockOut: '2026-03-01T12:30:00Z',
        category: 'walking', approved: false, notes: '',
      };
      expect(calculateHours(entry)).toBe(3.5);
    });

    it('should return 0 when not clocked out', () => {
      const entry = {
        id: 'h1', volunteerId: 'v1', date: '2026-03-01',
        clockIn: '2026-03-01T09:00:00Z', clockOut: null,
        category: 'walking', approved: false, notes: '',
      };
      expect(calculateHours(entry)).toBe(0);
    });

    it('should calculate total hours', () => {
      const entries = [
        { id: 'h1', volunteerId: 'v1', date: '2026-03-01', clockIn: '2026-03-01T09:00:00Z', clockOut: '2026-03-01T12:00:00Z', category: 'walking', approved: true, notes: '' },
        { id: 'h2', volunteerId: 'v1', date: '2026-03-02', clockIn: '2026-03-02T09:00:00Z', clockOut: '2026-03-02T11:00:00Z', category: 'feeding', approved: true, notes: '' },
      ];
      expect(calculateTotalHours(entries)).toBe(5);
    });

    it('should get hours by category', () => {
      const entries = [
        { id: 'h1', volunteerId: 'v1', date: '2026-03-01', clockIn: '2026-03-01T09:00:00Z', clockOut: '2026-03-01T12:00:00Z', category: 'walking', approved: true, notes: '' },
        { id: 'h2', volunteerId: 'v1', date: '2026-03-02', clockIn: '2026-03-02T09:00:00Z', clockOut: '2026-03-02T11:00:00Z', category: 'feeding', approved: true, notes: '' },
      ];
      const byCat = getHoursByCategory(entries);
      expect(byCat['walking']).toBe(3);
      expect(byCat['feeding']).toBe(2);
    });

    it('should approve hours', () => {
      const entry = clockIn('v1', 'walking');
      const approved = approveHours(entry, 'admin1');
      expect(approved.approved).toBe(true);
      expect(approved.approvedBy).toBe('admin1');
    });
  });

  describe('Recognition & Badges', () => {
    it('should have at least 9 badges', () => {
      expect(BADGES.length).toBeGreaterThanOrEqual(9);
    });

    it('should award hours badges at milestones', () => {
      const earned = checkBadgeEligibility({ totalHours: 55, tasksCompleted: 3, consecutiveDays: 2 }, []);
      const badgeIds = earned.map(b => b.id);
      expect(badgeIds).toContain('10-hours');
      expect(badgeIds).toContain('50-hours');
      expect(badgeIds).not.toContain('100-hours');
    });

    it('should not re-award earned badges', () => {
      const earned = checkBadgeEligibility({ totalHours: 55, tasksCompleted: 3, consecutiveDays: 2 }, ['10-hours', '50-hours']);
      expect(earned.find(b => b.id === '10-hours')).toBeUndefined();
    });

    it('should award task badges', () => {
      const earned = checkBadgeEligibility({ totalHours: 5, tasksCompleted: 12, consecutiveDays: 1 }, []);
      expect(earned.find(b => b.id === '10-tasks')).toBeDefined();
    });

    it('should award consecutive day badges', () => {
      const earned = checkBadgeEligibility({ totalHours: 10, tasksCompleted: 5, consecutiveDays: 8 }, []);
      expect(earned.find(b => b.id === '7-days')).toBeDefined();
    });

    it('should build leaderboard sorted by hours', () => {
      const volunteers = [
        { volunteerId: 'v1', name: 'Alice', totalHours: 30, tasksCompleted: 20, badgeCount: 3 },
        { volunteerId: 'v2', name: 'Bob', totalHours: 100, tasksCompleted: 50, badgeCount: 5 },
        { volunteerId: 'v3', name: 'Carol', totalHours: 60, tasksCompleted: 10, badgeCount: 2 },
      ];
      const lb = buildLeaderboard(volunteers, 'hours');
      expect(lb[0].volunteerId).toBe('v2');
      expect(lb[1].volunteerId).toBe('v3');
    });

    it('should build leaderboard sorted by tasks', () => {
      const volunteers = [
        { volunteerId: 'v1', name: 'Alice', totalHours: 100, tasksCompleted: 20, badgeCount: 3 },
        { volunteerId: 'v2', name: 'Bob', totalHours: 30, tasksCompleted: 50, badgeCount: 5 },
      ];
      const lb = buildLeaderboard(volunteers, 'tasks');
      expect(lb[0].volunteerId).toBe('v2');
    });

    it('should limit leaderboard entries', () => {
      const volunteers = Array.from({ length: 20 }, (_, i) => ({
        volunteerId: `v${i}`, name: `Vol ${i}`, totalHours: i * 10, tasksCompleted: i, badgeCount: 0,
      }));
      const lb = buildLeaderboard(volunteers, 'hours', 5);
      expect(lb).toHaveLength(5);
    });
  });

  describe('Training Tracker', () => {
    it('should have at least 7 training modules', () => {
      expect(TRAINING_MODULES.length).toBeGreaterThanOrEqual(7);
    });

    it('should identify required modules', () => {
      const required = getRequiredModules();
      expect(required.length).toBeGreaterThan(0);
      required.forEach(m => expect(m.required).toBe(true));
    });

    it('should detect complete training', () => {
      const required = getRequiredModules();
      const progress = required.map(m => ({
        moduleId: m.id,
        completedAt: '2026-01-01T00:00:00Z',
        score: 90,
        expiresAt: m.expirationMonths ? '2028-01-01T00:00:00Z' : null,
      }));
      expect(isTrainingComplete(progress)).toBe(true);
    });

    it('should detect incomplete training', () => {
      expect(isTrainingComplete([])).toBe(false);
    });

    it('should detect expired training', () => {
      const required = getRequiredModules();
      const progress = required.map(m => ({
        moduleId: m.id,
        completedAt: '2024-01-01T00:00:00Z',
        score: 90,
        expiresAt: m.expirationMonths ? '2025-01-01T00:00:00Z' : null, // expired
      }));
      expect(isTrainingComplete(progress)).toBe(false);
    });

    it('should compute training status', () => {
      const progress = [
        { moduleId: 'orientation', completedAt: '2026-01-01T00:00:00Z', score: 95, expiresAt: null },
        { moduleId: 'safety', completedAt: '2026-01-01T00:00:00Z', score: 88, expiresAt: '2028-01-01T00:00:00Z' },
      ];
      const status = getTrainingStatus(progress);
      expect(status.completed).toBe(2);
      expect(status.total).toBe(TRAINING_MODULES.length);
      expect(status.percentComplete).toBeGreaterThan(0);
    });
  });

  describe('Background Check', () => {
    it('should initiate a background check', () => {
      const check = initiateBackgroundCheck('v1');
      expect(check.status).toBe('submitted');
      expect(check.submittedAt).toBeTruthy();
    });

    it('should approve a background check', () => {
      const check = initiateBackgroundCheck('v1');
      const approved = reviewBackgroundCheck(check, true, 'All clear');
      expect(approved.status).toBe('approved');
      expect(approved.expiresAt).toBeTruthy();
      expect(approved.notes).toBe('All clear');
    });

    it('should deny a background check', () => {
      const check = initiateBackgroundCheck('v1');
      const denied = reviewBackgroundCheck(check, false, 'Issue found');
      expect(denied.status).toBe('denied');
      expect(denied.expiresAt).toBeNull();
    });

    it('should validate approved non-expired check', () => {
      const check = initiateBackgroundCheck('v1');
      const approved = reviewBackgroundCheck(check, true);
      expect(isBackgroundCheckValid(approved)).toBe(true);
    });

    it('should invalidate denied check', () => {
      const check = initiateBackgroundCheck('v1');
      const denied = reviewBackgroundCheck(check, false);
      expect(isBackgroundCheckValid(denied)).toBe(false);
    });
  });

  describe('Analytics', () => {
    it('should calculate volunteer analytics', () => {
      const volunteers = [
        { id: 'v1', status: 'active', name: 'Alice', totalHours: 50, tasksCompleted: 20, badgeCount: 3 },
        { id: 'v2', status: 'active', name: 'Bob', totalHours: 30, tasksCompleted: 10, badgeCount: 2 },
        { id: 'v3', status: 'inactive', name: 'Carol', totalHours: 10, tasksCompleted: 5, badgeCount: 1 },
      ];
      const entries = [
        { id: 'h1', volunteerId: 'v1', date: '2026-03-01', clockIn: '2026-03-01T09:00:00Z', clockOut: '2026-03-01T12:00:00Z', category: 'walking', approved: true, notes: '' },
        { id: 'h2', volunteerId: 'v2', date: '2026-03-02', clockIn: '2026-03-02T09:00:00Z', clockOut: '2026-03-02T11:00:00Z', category: 'feeding', approved: true, notes: '' },
      ];
      const analytics = calculateVolunteerAnalytics(volunteers, entries);
      expect(analytics.totalVolunteers).toBe(3);
      expect(analytics.activeVolunteers).toBe(2);
      expect(analytics.retentionRate).toBeGreaterThan(0);
      expect(analytics.totalHoursLogged).toBe(5);
      expect(analytics.topVolunteers.length).toBeGreaterThan(0);
    });
  });
});
