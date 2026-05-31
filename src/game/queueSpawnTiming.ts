export const SPAWN_INTERVAL_MIN_SEC = 0.5;
export const SPAWN_INTERVAL_MAX_SEC = 1.5;

export const ENTRY_SLIDE_DURATION_SEC = 0.65;

export function randomSpawnDelayMs(): number {
  const span = SPAWN_INTERVAL_MAX_SEC - SPAWN_INTERVAL_MIN_SEC;
  const sec = SPAWN_INTERVAL_MIN_SEC + Math.random() * span;
  return Math.round(sec * 1000);
}
