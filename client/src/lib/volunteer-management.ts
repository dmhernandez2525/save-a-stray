// ── Volunteer Management System ──────────────────────────────
// Registration, scheduling, task assignment, hours tracking, recognition, training

// ── Volunteer Registration ──────────────────────────────────

export type SkillCategory = 'animal-care' | 'admin' | 'transport' | 'events' | 'medical' | 'training' | 'photography';
export type AvailabilityDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type TaskCategory = 'walking' | 'feeding' | 'socialization' | 'cleaning' | 'admin' | 'transport' | 'events' | 'medical-assist';

export interface VolunteerRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: SkillCategory[];
  availability: AvailabilityDay[];
  interests: string[];
  emergencyContact: { name: string; phone: string; relationship: string };
  bio: string;
  photoUrl?: string;
  registeredAt: string;
  status: 'pending' | 'approved' | 'active' | 'inactive';
}

export interface VolunteerProfile extends VolunteerRegistration {
  totalHours: number;
  badges: Badge[];
  tasksCompleted: number;
  trainingModules: TrainingProgress[];
  backgroundCheckStatus: 'not-started' | 'pending' | 'approved' | 'expired';
}

const REQUIRED_FIELDS: (keyof VolunteerRegistration)[] = [
  'firstName', 'lastName', 'email', 'phone', 'skills', 'availability', 'emergencyContact',
];

export function validateRegistration(data: Partial<VolunteerRegistration>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`${field} is required`);
    } else if (Array.isArray(value) && value.length === 0) {
      errors.push(`${field} must have at least one entry`);
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.emergencyContact) {
    if (!data.emergencyContact.name) errors.push('Emergency contact name is required');
    if (!data.emergencyContact.phone) errors.push('Emergency contact phone is required');
  }

  return { valid: errors.length === 0, errors };
}

// ── Shift Scheduling ────────────────────────────────────────

export interface Shift {
  id: string;
  date: string;         // YYYY-MM-DD
  startTime: string;    // HH:MM
  endTime: string;      // HH:MM
  taskCategory: TaskCategory;
  maxVolunteers: number;
  assignedVolunteers: string[];   // volunteer IDs
  location: string;
  notes: string;
}

export function createShift(data: Omit<Shift, 'assignedVolunteers'>): Shift {
  return { ...data, assignedVolunteers: [] };
}

export function signUpForShift(
  shift: Shift,
  volunteerId: string
): { success: boolean; shift: Shift; reason?: string } {
  if (shift.assignedVolunteers.includes(volunteerId)) {
    return { success: false, shift, reason: 'Already signed up for this shift' };
  }
  if (shift.assignedVolunteers.length >= shift.maxVolunteers) {
    return { success: false, shift, reason: 'Shift is full' };
  }
  const updated = { ...shift, assignedVolunteers: [...shift.assignedVolunteers, volunteerId] };
  return { success: true, shift: updated };
}

export function removeFromShift(shift: Shift, volunteerId: string): { removed: boolean; shift: Shift } {
  const idx = shift.assignedVolunteers.indexOf(volunteerId);
  if (idx === -1) return { removed: false, shift };
  const updated = { ...shift, assignedVolunteers: shift.assignedVolunteers.filter(v => v !== volunteerId) };
  return { removed: true, shift: updated };
}

export function detectScheduleConflict(
  shifts: Shift[],
  volunteerId: string,
  newShift: Shift
): Shift | null {
  return shifts.find(s =>
    s.id !== newShift.id &&
    s.date === newShift.date &&
    s.assignedVolunteers.includes(volunteerId) &&
    timeOverlaps(s.startTime, s.endTime, newShift.startTime, newShift.endTime)
  ) || null;
}

function timeOverlaps(s1Start: string, s1End: string, s2Start: string, s2End: string): boolean {
  return s1Start < s2End && s2Start < s1End;
}

export function getWeeklySchedule(
  shifts: Shift[],
  weekStart: string
): Record<AvailabilityDay, Shift[]> {
  const startDate = new Date(weekStart);
  const days: AvailabilityDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const result: Record<string, Shift[]> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    result[days[i]] = shifts.filter(s => s.date === dateStr);
  }

  return result as Record<AvailabilityDay, Shift[]>;
}

// ── Task Assignment ─────────────────────────────────────────

export interface VolunteerTask {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  assignedTo: string | null;
  status: 'open' | 'assigned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  completedAt?: string;
}

export const TASK_CATEGORIES: { id: TaskCategory; label: string; icon: string }[] = [
  { id: 'walking', label: 'Dog Walking', icon: 'walk' },
  { id: 'feeding', label: 'Feeding', icon: 'food' },
  { id: 'socialization', label: 'Socialization', icon: 'people' },
  { id: 'cleaning', label: 'Cleaning', icon: 'clean' },
  { id: 'admin', label: 'Administration', icon: 'clipboard' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'medical-assist', label: 'Medical Assist', icon: 'medical' },
];

export function assignTask(task: VolunteerTask, volunteerId: string): VolunteerTask {
  return { ...task, assignedTo: volunteerId, status: 'assigned' };
}

export function completeTask(task: VolunteerTask): VolunteerTask {
  return { ...task, status: 'completed', completedAt: new Date().toISOString() };
}

export function getTasksByCategory(tasks: VolunteerTask[], category: TaskCategory): VolunteerTask[] {
  return tasks.filter(t => t.category === category);
}

export function getOpenTasks(tasks: VolunteerTask[]): VolunteerTask[] {
  return tasks.filter(t => t.status === 'open');
}

export function getVolunteerTasks(tasks: VolunteerTask[], volunteerId: string): VolunteerTask[] {
  return tasks.filter(t => t.assignedTo === volunteerId);
}

// ── Hours Tracking ──────────────────────────────────────────

export interface HoursEntry {
  id: string;
  volunteerId: string;
  date: string;
  clockIn: string;     // ISO datetime
  clockOut: string | null;
  category: TaskCategory;
  approved: boolean;
  approvedBy?: string;
  notes: string;
}

export function clockIn(volunteerId: string, category: TaskCategory, notes: string = ''): HoursEntry {
  const now = new Date().toISOString();
  return {
    id: `hrs-${Date.now()}`,
    volunteerId,
    date: now.split('T')[0],
    clockIn: now,
    clockOut: null,
    category,
    approved: false,
    notes,
  };
}

export function clockOut(entry: HoursEntry): HoursEntry {
  return { ...entry, clockOut: new Date().toISOString() };
}

export function calculateHours(entry: HoursEntry): number {
  if (!entry.clockOut) return 0;
  const ms = new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime();
  return Math.round((ms / 3600000) * 100) / 100;
}

export function calculateTotalHours(entries: HoursEntry[]): number {
  return Math.round(entries.reduce((sum, e) => sum + calculateHours(e), 0) * 100) / 100;
}

export function getHoursByCategory(entries: HoursEntry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const e of entries) {
    result[e.category] = (result[e.category] || 0) + calculateHours(e);
  }
  for (const key of Object.keys(result)) {
    result[key] = Math.round(result[key] * 100) / 100;
  }
  return result;
}

export function approveHours(entry: HoursEntry, approverId: string): HoursEntry {
  return { ...entry, approved: true, approvedBy: approverId };
}

// ── Recognition & Badges ────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  milestone: number;    // hours or tasks to earn
  milestoneType: 'hours' | 'tasks' | 'consecutive-days';
}

export const BADGES: Badge[] = [
  { id: 'first-shift', name: 'First Shift', description: 'Completed your first volunteer shift', icon: 'star', milestone: 1, milestoneType: 'tasks' },
  { id: '10-hours', name: 'Helping Hand', description: 'Logged 10 volunteer hours', icon: 'hand', milestone: 10, milestoneType: 'hours' },
  { id: '50-hours', name: 'Dedicated', description: 'Logged 50 volunteer hours', icon: 'heart', milestone: 50, milestoneType: 'hours' },
  { id: '100-hours', name: 'Champion', description: 'Logged 100 volunteer hours', icon: 'trophy', milestone: 100, milestoneType: 'hours' },
  { id: '250-hours', name: 'Hero', description: 'Logged 250 volunteer hours', icon: 'medal', milestone: 250, milestoneType: 'hours' },
  { id: '10-tasks', name: 'Task Master', description: 'Completed 10 tasks', icon: 'check', milestone: 10, milestoneType: 'tasks' },
  { id: '50-tasks', name: 'Workhorse', description: 'Completed 50 tasks', icon: 'bolt', milestone: 50, milestoneType: 'tasks' },
  { id: '7-days', name: 'Streak', description: 'Volunteered 7 consecutive days', icon: 'fire', milestone: 7, milestoneType: 'consecutive-days' },
  { id: '30-days', name: 'Iron Will', description: 'Volunteered 30 consecutive days', icon: 'shield', milestone: 30, milestoneType: 'consecutive-days' },
];

export function checkBadgeEligibility(
  stats: { totalHours: number; tasksCompleted: number; consecutiveDays: number },
  earnedBadges: string[]
): Badge[] {
  return BADGES.filter(badge => {
    if (earnedBadges.includes(badge.id)) return false;
    if (badge.milestoneType === 'hours') return stats.totalHours >= badge.milestone;
    if (badge.milestoneType === 'tasks') return stats.tasksCompleted >= badge.milestone;
    if (badge.milestoneType === 'consecutive-days') return stats.consecutiveDays >= badge.milestone;
    return false;
  });
}

export interface LeaderboardEntry {
  volunteerId: string;
  name: string;
  totalHours: number;
  tasksCompleted: number;
  badgeCount: number;
}

export function buildLeaderboard(
  volunteers: LeaderboardEntry[],
  sortBy: 'hours' | 'tasks' | 'badges' = 'hours',
  limit: number = 10
): LeaderboardEntry[] {
  const sortFn: Record<string, (a: LeaderboardEntry, b: LeaderboardEntry) => number> = {
    hours: (a, b) => b.totalHours - a.totalHours,
    tasks: (a, b) => b.tasksCompleted - a.tasksCompleted,
    badges: (a, b) => b.badgeCount - a.badgeCount,
  };
  return [...volunteers].sort(sortFn[sortBy] || sortFn.hours).slice(0, limit);
}

// ── Training Tracker ────────────────────────────────────────

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  required: boolean;
  estimatedMinutes: number;
  category: string;
  expirationMonths: number | null;  // null = never expires
}

export interface TrainingProgress {
  moduleId: string;
  completedAt: string | null;
  score: number | null;
  expiresAt: string | null;
}

export const TRAINING_MODULES: TrainingModule[] = [
  { id: 'orientation', title: 'Volunteer Orientation', description: 'Basic shelter rules and procedures', required: true, estimatedMinutes: 60, category: 'general', expirationMonths: null },
  { id: 'safety', title: 'Safety Training', description: 'Personal safety and emergency procedures', required: true, estimatedMinutes: 45, category: 'safety', expirationMonths: 12 },
  { id: 'animal-handling', title: 'Animal Handling', description: 'Safe techniques for handling animals', required: true, estimatedMinutes: 90, category: 'animal-care', expirationMonths: 12 },
  { id: 'dog-walking', title: 'Dog Walking Protocol', description: 'Leash skills and walking routes', required: false, estimatedMinutes: 30, category: 'animal-care', expirationMonths: null },
  { id: 'cat-care', title: 'Cat Socialization', description: 'Feline behavior and socialization techniques', required: false, estimatedMinutes: 45, category: 'animal-care', expirationMonths: null },
  { id: 'first-aid', title: 'Animal First Aid', description: 'Basic first aid for common animal emergencies', required: false, estimatedMinutes: 120, category: 'medical', expirationMonths: 24 },
  { id: 'customer-service', title: 'Customer Service', description: 'Assisting adopters and visitors', required: false, estimatedMinutes: 30, category: 'general', expirationMonths: null },
];

export function getRequiredModules(): TrainingModule[] {
  return TRAINING_MODULES.filter(m => m.required);
}

export function isTrainingComplete(progress: TrainingProgress[]): boolean {
  const required = getRequiredModules();
  return required.every(mod => {
    const p = progress.find(pr => pr.moduleId === mod.id);
    if (!p || !p.completedAt) return false;
    if (mod.expirationMonths && p.expiresAt) {
      return new Date(p.expiresAt) > new Date();
    }
    return true;
  });
}

export function getTrainingStatus(progress: TrainingProgress[]): {
  completed: number;
  required: number;
  total: number;
  expired: number;
  percentComplete: number;
} {
  const required = getRequiredModules();
  const now = new Date();
  let completed = 0;
  let expired = 0;

  for (const mod of TRAINING_MODULES) {
    const p = progress.find(pr => pr.moduleId === mod.id);
    if (p && p.completedAt) {
      if (p.expiresAt && new Date(p.expiresAt) <= now) {
        expired++;
      } else {
        completed++;
      }
    }
  }

  return {
    completed,
    required: required.length,
    total: TRAINING_MODULES.length,
    expired,
    percentComplete: TRAINING_MODULES.length > 0 ? Math.round((completed / TRAINING_MODULES.length) * 100) : 0,
  };
}

// ── Background Check Workflow ───────────────────────────────

export type BackgroundCheckStatus = 'not-started' | 'submitted' | 'in-review' | 'approved' | 'denied' | 'expired';

export interface BackgroundCheck {
  volunteerId: string;
  status: BackgroundCheckStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  notes: string;
}

export function initiateBackgroundCheck(volunteerId: string): BackgroundCheck {
  return {
    volunteerId,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    expiresAt: null,
    notes: '',
  };
}

export function reviewBackgroundCheck(
  check: BackgroundCheck,
  approved: boolean,
  notes: string = ''
): BackgroundCheck {
  const now = new Date();
  const expiresAt = approved
    ? new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString()
    : null;

  return {
    ...check,
    status: approved ? 'approved' : 'denied',
    reviewedAt: now.toISOString(),
    expiresAt,
    notes,
  };
}

export function isBackgroundCheckValid(check: BackgroundCheck): boolean {
  if (check.status !== 'approved') return false;
  if (!check.expiresAt) return false;
  return new Date(check.expiresAt) > new Date();
}

// ── Volunteer Analytics ─────────────────────────────────────

export interface VolunteerAnalytics {
  totalVolunteers: number;
  activeVolunteers: number;
  totalHoursLogged: number;
  averageHoursPerVolunteer: number;
  retentionRate: number;
  hoursByCategory: Record<string, number>;
  topVolunteers: LeaderboardEntry[];
}

export function calculateVolunteerAnalytics(
  volunteers: { id: string; status: string; name: string; totalHours: number; tasksCompleted: number; badgeCount: number }[],
  hoursEntries: HoursEntry[]
): VolunteerAnalytics {
  const total = volunteers.length;
  const active = volunteers.filter(v => v.status === 'active').length;
  const totalHoursLogged = calculateTotalHours(hoursEntries);
  const hoursByCat = getHoursByCategory(hoursEntries);

  const leaderboard = buildLeaderboard(
    volunteers.map(v => ({
      volunteerId: v.id,
      name: v.name,
      totalHours: v.totalHours,
      tasksCompleted: v.tasksCompleted,
      badgeCount: v.badgeCount,
    })),
    'hours',
    5
  );

  return {
    totalVolunteers: total,
    activeVolunteers: active,
    totalHoursLogged,
    averageHoursPerVolunteer: total > 0 ? Math.round((totalHoursLogged / total) * 100) / 100 : 0,
    retentionRate: total > 0 ? Math.round((active / total) * 100) : 0,
    hoursByCategory: hoursByCat,
    topVolunteers: leaderboard,
  };
}
