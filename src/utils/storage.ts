const MEM: Record<string, string> = {};

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return MEM[key] ? (JSON.parse(MEM[key]) as T) : fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    MEM[key] = raw;
  }
}

export function removeStorageItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    delete MEM[key];
  }
}

export function estimatedSize(): number {
  try {
    let n = 0;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i) ?? "";
      const v = window.localStorage.getItem(k) ?? "";
      n += k.length + v.length;
    }
    return Math.round((n * 2) / 1024 / 1024); // MB (UTF-16 rough)
  } catch {
    return 0;
  }
}
