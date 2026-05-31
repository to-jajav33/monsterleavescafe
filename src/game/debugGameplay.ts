import type { SeatRole } from "../scene/CounterSeat.ts";

/** Flip false before shipping — restores per-monster patience from {@link Monster}. */
export const DEBUG_SHORT_RAGE = true;

/** Target patience at Exit once the active ramp finishes (faster rage). */
export const DEBUG_RAGE_PATIENCE_SEC = 6;

/** Seconds on active duty before rage speed reaches {@link DEBUG_RAGE_PATIENCE_SEC}. */
export const ACTIVE_RAGE_RAMP_SEC = 12;

/**
 * Active customer patience: starts at normal (queue speed), eases down to debug speed.
 * Lower seconds = faster rage.
 */
export function activePatienceSeconds(
  normalPatienceSec: number,
  secondsOnActive: number,
): number {
  if (!DEBUG_SHORT_RAGE) {
    return normalPatienceSec;
  }
  const t = Math.min(1, Math.max(0, secondsOnActive / ACTIVE_RAGE_RAMP_SEC));
  return normalPatienceSec + (DEBUG_RAGE_PATIENCE_SEC - normalPatienceSec) * t;
}

export function patienceForRole(
  normalPatienceSec: number,
  role: SeatRole,
  secondsOnActive: number,
): number {
  if (role !== "active") {
    return normalPatienceSec;
  }
  return activePatienceSeconds(normalPatienceSec, secondsOnActive);
}
