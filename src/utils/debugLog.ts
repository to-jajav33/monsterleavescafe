const TAG = "[MLC]";

/** Set false to silence debug logs in development. */
export const DEBUG_LOGS = true;

export function debugLog(...args: unknown[]): void {
  if (!DEBUG_LOGS) return;
  console.log(TAG, ...args);
}

export function debugWarn(...args: unknown[]): void {
  if (!DEBUG_LOGS) return;
  console.warn(TAG, ...args);
}
