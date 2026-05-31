export const BOSS_CUTIE_RUNNING_URL = "/assets/image-boss-cutie-running-1.png";

export const BOSS_CUTIE_RUNNING_NATIVE = {
  width: 1370,
  height: 771,
} as const;

/** Display size on game-over overlay (design units). */
export const BOSS_CUTIE_DISPLAY_WIDTH = 500;
export const BOSS_CUTIE_DISPLAY_HEIGHT = Math.round(
  (BOSS_CUTIE_RUNNING_NATIVE.height / BOSS_CUTIE_RUNNING_NATIVE.width) *
    BOSS_CUTIE_DISPLAY_WIDTH,
);
