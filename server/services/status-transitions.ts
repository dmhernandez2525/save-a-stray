import { AnimalStatus } from '../../shared/types';

// Valid transitions from each status
const VALID_TRANSITIONS: Record<AnimalStatus, AnimalStatus[]> = {
  available: ['pending', 'hold', 'fostered', 'transferred', 'deceased'],
  pending: ['available', 'adopted', 'hold', 'transferred', 'deceased'],
  hold: ['available', 'pending', 'fostered', 'transferred', 'deceased'],
  adopted: ['available'], // only with admin override
  fostered: ['available', 'pending', 'hold', 'adopted', 'transferred', 'deceased'],
  transferred: ['available'],
  deceased: [], // terminal state
};

export function isValidTransition(from: AnimalStatus, to: AnimalStatus): boolean {
  if (from === to) return false;
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function getValidTransitions(from: AnimalStatus): AnimalStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}
