const KEY = "KENBA_pending_ref";

export function savePendingReferral(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, code.trim().toUpperCase());
}

export function readPendingReferral(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function clearPendingReferral() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
