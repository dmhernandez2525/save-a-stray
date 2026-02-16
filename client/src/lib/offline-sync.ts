import { putItem, getAllItems, deleteItem, getItem } from './offline-storage';

export interface SyncQueueEntry {
  id: string;
  operation: string;
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
  maxRetries: number;
  lastError?: string;
}

export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge';
  field: string;
}

const SYNC_STORE = 'sync-queue';
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 60000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function queueOfflineAction(
  operation: string,
  payload: Record<string, unknown>
): Promise<string> {
  const entry: SyncQueueEntry = {
    id: generateId(),
    operation,
    payload,
    createdAt: Date.now(),
    retries: 0,
    maxRetries: 5,
  };
  await putItem(SYNC_STORE, entry);
  return entry.id;
}

export async function getQueuedActions(): Promise<SyncQueueEntry[]> {
  const items = await getAllItems<SyncQueueEntry>(SYNC_STORE);
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getQueueSize(): Promise<number> {
  const items = await getQueuedActions();
  return items.length;
}

export async function removeFromQueue(id: string): Promise<void> {
  await deleteItem(SYNC_STORE, id);
}

function getBackoffDelay(retries: number): number {
  const delay = BASE_DELAY_MS * Math.pow(2, retries);
  const jitter = Math.random() * BASE_DELAY_MS;
  return Math.min(delay + jitter, MAX_DELAY_MS);
}

export type SyncExecutor = (entry: SyncQueueEntry) => Promise<boolean>;

export async function processQueue(executor: SyncExecutor): Promise<{
  succeeded: number;
  failed: number;
  remaining: number;
}> {
  const queue = await getQueuedActions();
  let succeeded = 0;
  let failed = 0;

  for (const entry of queue) {
    if (entry.retries >= entry.maxRetries) {
      failed++;
      continue;
    }

    const delay = entry.retries > 0 ? getBackoffDelay(entry.retries) : 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const success = await executor(entry);
      if (success) {
        await removeFromQueue(entry.id);
        succeeded++;
      } else {
        entry.retries++;
        entry.lastError = 'Executor returned false';
        await putItem(SYNC_STORE, entry);
        failed++;
      }
    } catch (err) {
      entry.retries++;
      entry.lastError = err instanceof Error ? err.message : 'Unknown error';
      await putItem(SYNC_STORE, entry);
      failed++;
    }
  }

  const remaining = (await getQueuedActions()).length;
  return { succeeded, failed, remaining };
}

export function resolveConflict<T>(
  serverValue: T,
  clientValue: T,
  resolution: ConflictResolution
): T {
  if (resolution.strategy === 'server-wins') return serverValue;
  if (resolution.strategy === 'client-wins') return clientValue;

  // Merge: client value for draft fields, server for status fields
  if (typeof serverValue === 'object' && typeof clientValue === 'object' &&
      serverValue !== null && clientValue !== null) {
    return { ...serverValue, ...clientValue };
  }
  return serverValue;
}

export interface FreshnessInfo {
  cachedAt: number;
  isStale: boolean;
  ageMinutes: number;
  label: string;
}

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export function checkFreshness(cachedAt: number): FreshnessInfo {
  const ageMs = Date.now() - cachedAt;
  const ageMinutes = Math.floor(ageMs / 60000);
  const isStale = ageMs > STALE_THRESHOLD_MS;

  let label: string;
  if (ageMinutes < 1) label = 'Just now';
  else if (ageMinutes < 60) label = `${ageMinutes}m ago`;
  else if (ageMinutes < 1440) label = `${Math.floor(ageMinutes / 60)}h ago`;
  else label = `${Math.floor(ageMinutes / 1440)}d ago`;

  return { cachedAt, isStale, ageMinutes, label };
}

export async function cacheAnimalForOffline(animal: Record<string, unknown>): Promise<void> {
  await putItem('animals', { ...animal, id: animal._id || animal.id, cachedAt: Date.now() });
}

export async function getCachedAnimal(id: string): Promise<Record<string, unknown> | undefined> {
  return getItem('animals', id);
}

export async function getCachedAnimals(): Promise<Record<string, unknown>[]> {
  return getAllItems('animals');
}

export interface OfflineFavorite {
  animalId: string;
  action: 'add' | 'remove';
  synced: boolean;
  createdAt: number;
}

export async function toggleOfflineFavorite(animalId: string, action: 'add' | 'remove'): Promise<void> {
  const favorite: OfflineFavorite = {
    animalId,
    action,
    synced: false,
    createdAt: Date.now(),
  };
  await putItem('favorites', favorite);
}

export async function getUnsyncedFavorites(): Promise<OfflineFavorite[]> {
  return getAllItems<OfflineFavorite>('favorites');
}

export interface ApplicationDraft {
  id: string;
  animalId: string;
  formData: Record<string, unknown>;
  status: 'draft' | 'pending-upload' | 'submitted';
  lastModified: number;
  createdAt: number;
}

export async function saveApplicationDraft(draft: ApplicationDraft): Promise<void> {
  await putItem('application-drafts', { ...draft, lastModified: Date.now() });
}

export async function getApplicationDraft(id: string): Promise<ApplicationDraft | undefined> {
  return getItem('application-drafts', id);
}

export async function getAllDrafts(): Promise<ApplicationDraft[]> {
  return getAllItems('application-drafts');
}

export async function deleteDraft(id: string): Promise<void> {
  await deleteItem('application-drafts', id);
}
