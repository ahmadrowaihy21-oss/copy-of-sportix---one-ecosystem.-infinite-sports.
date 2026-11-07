// Storage can be unavailable in restricted browser contexts. Session data is optional.
export function getSessionStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function readSessionValue(key: string, storage: Pick<Storage, "getItem"> | undefined = getSessionStorage()): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeSessionValue(key: string, value: string): void {
  try {
    getSessionStorage()?.setItem(key, value);
  } catch {
    // Keep the current UI usable when storage is full or blocked.
  }
}

export function removeSessionValue(key: string): void {
  try {
    getSessionStorage()?.removeItem(key);
  } catch {
    // Clearing optional recovery data must not block navigation or sign-in.
  }
}
