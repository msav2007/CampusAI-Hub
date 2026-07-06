export function readJsonFromStorage<T>(key: string, fallback: T | null = null): T | null {
  if (typeof window === "undefined") return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return fallback;
    return JSON.parse(rawValue) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to parse key: ${key}. Clearing corrupted data.`);
    removeStorageItem(key);
    return fallback;
  }
}

export function writeJsonToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[Storage] Failed to write key: ${key}`, err);
    return false;
  }
}

export function removeStorageItem(key: string) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
