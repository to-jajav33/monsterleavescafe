import { Vec2 } from "../utils/math.ts";

import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";
import { COUNTER_TOP_EDGE_Y } from "./sceneAssets.ts";

export const SLIME_IDLE_URL = "/assets/image-monster-slime-idle-1.png";

/** Native export size — 1 design unit per pixel (drawn to match bg + counter). */
export const SLIME_IDLE_NATIVE = {
  width: 1320,
  height: 743,
} as const;

/**
 * Minimum center-to-center spacing so 1320px-wide slime planes do not overlap.
 * Wider than {@link DESIGN_WIDTH} — cannot fit three non-overlapping slimes in frame
 * with Seat R at x=280; use for layout audits, not {@link SEAT_X} stool positions.
 */
export const MONSTER_SEAT_PITCH = SLIME_IDLE_NATIVE.width;

/** Gap between counter cream edge and slime feet (design units). */
export const SLIME_FEET_ABOVE_COUNTER = 4;

/** Move slime down toward the counter (+Y is up). */
export const SLIME_DROP_TOWARD_COUNTER = 100;

export const SLIME_IDLE_FRAMES = {
  idle: SLIME_IDLE_URL,
  angry1: "/assets/image-monster-slime-angry-1.png",
  angry2: "/assets/image-monster-slime-angry-2.png",
  jumpScare: "/assets/image-monster-slime-jump-scare-1.png",
} as const;

/**
 * How far right of seat center the slime body reads (not 1320px artboard).
 * Used so order bubbles sit beside the visible blob, not off-screen right.
 */
export const SLIME_BUBBLE_ANCHOR_WIDTH = 300;

/** Nudge bubble toward head from sprite vertical center. */
export const SLIME_BUBBLE_Y_OFFSET = 80;

/** Center for a bottom-anchored slime at a seat X. */
export function slimeSpriteCenterAtSeat(seatX: number): Vec2 {
  const bottom =
    COUNTER_TOP_EDGE_Y +
    SLIME_FEET_ABOVE_COUNTER -
    SLIME_DROP_TOWARD_COUNTER;
  return new Vec2(seatX, bottom + SLIME_IDLE_NATIVE.height / 2);
}

/** Order/rage bubble beside visible slime (anchored at seat X, not artboard right edge). */
export function slimeOrderBubbleCenter(seatX: number): Vec2 {
  const sprite = slimeSpriteCenterAtSeat(seatX);
  return bubbleCenterBesideMonster(
    new Vec2(seatX, sprite.y + SLIME_BUBBLE_Y_OFFSET),
    SLIME_BUBBLE_ANCHOR_WIDTH,
  );
}

