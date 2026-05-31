import { Vec2 } from "../utils/math.ts";

import { monsterSpriteCenterAtSeat } from "./monsterLayout.ts";
import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";

export const MEDUSA_IDLE_URL = "/assets/image-monster-medusa-idle-1.png";

/** Glowing eyes during Medusa hide reveal (same sheet size as idle). */
export const MEDUSA_EYES_GLOW_URL = "/assets/image-monster-medusa-stone-1.png";

export const MEDUSA_IDLE_NATIVE = {
  width: 1320,
  height: 743,
} as const;

export const MEDUSA_IDLE_FRAMES = {
  idle: MEDUSA_IDLE_URL,
  eyesGlow: MEDUSA_EYES_GLOW_URL,
  angry1: "/assets/image-monster-medusa-angry-1.png",
  jumpScare: "/assets/image-monster-medusa-jumpscare-2.png",
  /** Failed hide — petrified (reuses glow sheet until dedicated stoned art exists). */
  stone: MEDUSA_EYES_GLOW_URL,
} as const;

export const MEDUSA_BUBBLE_ANCHOR_WIDTH = 320;

export const MEDUSA_BUBBLE_Y_OFFSET = 100;

export function medusaSpriteCenterAtSeat(seatX: number): Vec2 {
  return monsterSpriteCenterAtSeat(seatX, MEDUSA_IDLE_NATIVE.height);
}

export function medusaOrderBubbleCenter(seatX: number): Vec2 {
  const sprite = medusaSpriteCenterAtSeat(seatX);
  return bubbleCenterBesideMonster(
    new Vec2(seatX, sprite.y + MEDUSA_BUBBLE_Y_OFFSET),
    MEDUSA_BUBBLE_ANCHOR_WIDTH,
  );
}
