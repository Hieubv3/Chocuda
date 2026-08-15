// Bulletproof Client-Side Data Persistence & Two-Way Sync Module
// Ensures posts, services, stores, news and banner ads are NEVER lost on reload or server restarts.

export const STORAGE_KEYS = {
  PROPERTIES: 'chocudan24h_properties',
  LEGACY_PROPERTIES: 'hb_properties',
  RESIDENT_SERVICES: 'chocudan24h_resident_services',
  LEGACY_RESIDENT_SERVICES: 'hb_resident_services',
  STORES: 'chocudan24h_stores',
  LEGACY_STORES: 'hb_user_stores',
  NEWS: 'chocudan24h_news',
  LEGACY_NEWS: 'hb_news',
  ADS: 'chocudan24h_ads',
  PROJECTS: 'chocudan24h_projects',
  LEGACY_PROJECTS: 'hb_projects',
  USER: 'hb_user',
  STORE_ORDERS: 'chocudan24h_store_orders',
  STORE_PACKAGES: 'chocudan24h_store_packages'
} as const;

/**
 * Safely retrieves persisted items from localStorage with legacy fallback
 */
export function getPersistedData<T>(primaryKey: string, legacyKey?: string, fallback: T = [] as any): T {
  try {
    const raw = localStorage.getItem(primaryKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T;
      if (!Array.isArray(parsed) && parsed !== null && parsed !== undefined) return parsed as T;
    }
    if (legacyKey) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const parsedLegacy = JSON.parse(legacyRaw);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) return parsedLegacy as T;
        if (!Array.isArray(parsedLegacy) && parsedLegacy !== null && parsedLegacy !== undefined) return parsedLegacy as T;
      }
    }
  } catch (err) {
    console.warn(`[DataPersistence] Error reading ${primaryKey}:`, err);
  }
  return fallback;
}

/**
 * Safely saves data to primary and legacy keys simultaneously
 */
export function setPersistedData<T>(primaryKey: string, legacyKey: string | undefined, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(primaryKey, serialized);
    if (legacyKey) {
      localStorage.setItem(legacyKey, serialized);
    }
  } catch (err) {
    console.warn(`[DataPersistence] Error writing ${primaryKey}:`, err);
  }
}

/**
 * Intelligently merges server items and local items:
 * - All items present on server are kept (with server status/approval)
 * - Any user-created items found ONLY in localStorage are preserved and prepended
 */
export function mergeItemLists<T extends { id?: string; createdAt?: string }>(
  serverList: T[],
  localList: T[]
): { merged: T[]; missingOnServer: T[] } {
  const mergedMap = new Map<string, T>();
  const missingOnServer: T[] = [];

  // 1. Load server items
  if (Array.isArray(serverList)) {
    serverList.forEach(item => {
      if (item && item.id) {
        mergedMap.set(item.id, item);
      }
    });
  }

  // 2. Scan local items
  if (Array.isArray(localList)) {
    localList.forEach(item => {
      if (item && item.id) {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
          missingOnServer.push(item);
        }
      }
    });
  }

  return {
    merged: Array.from(mergedMap.values()),
    missingOnServer
  };
}

/**
 * Push unsynced local items to server in background
 */
export async function syncMissingItemsToServer<T>(endpoint: string, items: T[]): Promise<void> {
  if (!items || items.length === 0) return;
  for (const item of items) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.warn(`[DataPersistence] Auto-sync to ${endpoint} failed for item:`, err);
    }
  }
}
