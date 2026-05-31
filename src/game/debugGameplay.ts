/** Flip false before shipping — restores per-monster patience from {@link Monster}. */
export const DEBUG_SHORT_RAGE = true;

/** Seconds 0→100% rage when {@link DEBUG_SHORT_RAGE} is on (all monster types). */
export const DEBUG_RAGE_PATIENCE_SEC = 6;

export function effectivePatienceSeconds(normalPatienceSec: number): number {
  return DEBUG_SHORT_RAGE ? DEBUG_RAGE_PATIENCE_SEC : normalPatienceSec;
}
