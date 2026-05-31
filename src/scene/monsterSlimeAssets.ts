import { Vec2 } from "../utils/math.ts";

import { monsterSpriteCenterAtSeat } from "./monsterLayout.ts";
import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";

export const SLIME_IDLE_URL = "/assets/image-monster-slime-idle-1.png";

/** Native export size — 1 design unit per pixel (feet on frame bottom in art). */
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

export const SLIME_IDLE_FRAMES = {
  idle: SLIME_IDLE_URL,
  angry1: "/assets/image-monster-slime-angry-1.png",
  angry2: "/assets/image-monster-slime-angry-2.png",
  jumpScare: "/assets/image-monster-slime-jump-scare-1.png",
} as const;

export const SLIME_BUBBLE_ANCHOR_WIDTH = 300;

export const SLIME_BUBBLE_Y_OFFSET = 80;

export function slimeSpriteCenterAtSeat(seatX: number): Vec2 {
  return monsterSpriteCenterAtSeat(seatX, SLIME_IDLE_NATIVE.height);
}

export function slimeOrderBubbleCenter(seatX: number): Vec2 {
  const sprite = slimeSpriteCenterAtSeat(seatX);
  return bubbleCenterBesideMonster(
    new Vec2(seatX, sprite.y + SLIME_BUBBLE_Y_OFFSET),
    SLIME_BUBBLE_ANCHOR_WIDTH,
  );
}
