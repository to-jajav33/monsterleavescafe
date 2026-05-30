const TAG = "[MLC]";

export function debugLog(...args: unknown[]): void {
  console.log(TAG, ...args);
}

export function debugWarn(...args: unknown[]): void {
  console.warn(TAG, ...args);
}
