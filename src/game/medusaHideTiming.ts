/** Seconds after Medusa becomes active before the hide event can arm. */
export const MEDUSA_HIDE_ARM_DELAY_MIN_SEC = 2;
export const MEDUSA_HIDE_ARM_DELAY_MAX_SEC = 6;

/** Hide button pulse + idle face (step 1). */
export const MEDUSA_HIDE_TELEGRAPH_SEC = 1;

/** Red eyes visible; player may already be hiding (step 3). */
export const MEDUSA_HIDE_REVEAL_SEC = 0.35;

/** Must be hiding by end of window (step 4). */
export const MEDUSA_HIDE_DANGER_SEC = 0.5;

/** After a successful hide, eyes stay red briefly before idle (step 7). */
export const MEDUSA_HIDE_EYES_COOLDOWN_SEC = 0.6;

export function randomMedusaHideArmDelaySec(): number {
  const span = MEDUSA_HIDE_ARM_DELAY_MAX_SEC - MEDUSA_HIDE_ARM_DELAY_MIN_SEC;
  return MEDUSA_HIDE_ARM_DELAY_MIN_SEC + Math.random() * span;
}
