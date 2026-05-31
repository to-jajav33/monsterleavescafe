import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";

/** Full design frame — lives PNGs stretch to cover the 1280×720 screen. */
export const LIVES_HUD_SIZE = {
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
} as const;

export const LIVES_HUD_CENTER = { x: 0, y: 0 } as const;

export const STARTING_LIVES = 3;

export type LivesCount = 0 | 1 | 2 | 3;

export function livesImageUrl(count: LivesCount): string {
  return `/assets/image-lives-${count}.png`;
}
