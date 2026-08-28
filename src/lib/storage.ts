/**
 * localStorage that cannot throw.
 *
 * Safari private mode, embedded webviews, and browsers with site data blocked
 * all throw on read OR write. Every call here degrades to a no-op instead, so a
 * donor with storage disabled still sees a fully working site.
 */

function backing(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__osa_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

let cached: Storage | null | undefined;

function store(): Storage | null {
  if (cached === undefined) cached = backing();
  return cached;
}

export function readJson<T>(key: string, fallback: T): T {
  const s = store();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  const s = store();
  if (!s) return false;
  try {
    s.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded, or storage revoked mid-session.
    return false;
  }
}

export function remove(key: string): void {
  const s = store();
  if (!s) return;
  try {
    s.removeItem(key);
  } catch {
    /* no-op */
  }
}

export function storageAvailable(): boolean {
  return store() !== null;
}
