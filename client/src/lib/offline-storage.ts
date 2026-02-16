const DB_NAME = 'save-a-stray-offline';
const DB_VERSION = 1;

interface OfflineStore {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique: boolean }[];
}

const STORES: OfflineStore[] = [
  {
    name: 'animals',
    keyPath: 'id',
    indexes: [
      { name: 'by-type', keyPath: 'type', unique: false },
      { name: 'by-cached-at', keyPath: 'cachedAt', unique: false },
    ],
  },
  {
    name: 'favorites',
    keyPath: 'animalId',
    indexes: [
      { name: 'by-synced', keyPath: 'synced', unique: false },
    ],
  },
  {
    name: 'application-drafts',
    keyPath: 'id',
    indexes: [
      { name: 'by-status', keyPath: 'status', unique: false },
    ],
  },
  {
    name: 'search-results',
    keyPath: 'queryHash',
    indexes: [
      { name: 'by-cached-at', keyPath: 'cachedAt', unique: false },
    ],
  },
  {
    name: 'sync-queue',
    keyPath: 'id',
    indexes: [
      { name: 'by-created', keyPath: 'createdAt', unique: false },
      { name: 'by-retries', keyPath: 'retries', unique: false },
    ],
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
          for (const idx of store.indexes ?? []) {
            objectStore.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
          }
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getItem<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function countItems(storeName: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
