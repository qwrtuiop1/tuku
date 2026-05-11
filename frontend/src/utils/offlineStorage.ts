// IndexedDB-based offline storage for viewed files

const DB_NAME = 'tuku-offline';
const STORE_NAME = 'cached-files';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

export async function cacheFile(url: string, blob: Blob, metadata: { fileId: number; name: string }): Promise<IDBValidKey> {
  if (!db) await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({
      url,
      blob,
      metadata,
      createdAt: Date.now(),
      size: blob.size
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedFile(url: string): Promise<{ url: string; blob: Blob; metadata: any } | null> {
  if (!db) await initOfflineDB();
  return new Promise<{ url: string; blob: Blob; metadata: any } | null>((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(url);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearExpiredCache(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  if (!db) await initOfflineDB();
  const cutoff = Date.now() - maxAgeMs;
  const tx = db!.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('createdAt');
  return new Promise<void>((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) { cursor.delete(); cursor.continue(); }
      else resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCacheSize(): Promise<number> {
  if (!db) await initOfflineDB();
  return new Promise<number>((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    let totalSize = 0;
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) { totalSize += cursor.value.size || 0; cursor.continue(); }
      else resolve(totalSize);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllCache(): Promise<void> {
  if (!db) await initOfflineDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
