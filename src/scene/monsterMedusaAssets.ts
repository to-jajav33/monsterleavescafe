import { Vec2 } from "../utils/math.ts";

import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";
import {
  SLIME_DROP_TOWARD_COUNTER,
  SLIME_FEET_ABOVE_COUNTER,
} from "./monsterSlimeAssets.ts";
import { COUNTER_TOP_EDGE_Y } from "./sceneAssets.ts";

export const MEDUSA_IDLE_URL = "/assets/image-monster-medusa-idle-1.png";

/** Native export size — matches slime artboard (1320×743). */
export const MEDUSA_IDLE_NATIVE = {
  width: 1320,
  height: 743,
} as const;

export const MEDUSA_IDLE_FRAMES = {
  idle: MEDUSA_IDLE_URL,
  angry1: "/assets/image-monster-medusa-angry-1.png",
  angry2: "/assets/image-monster-medusa-angry-2.png",
  stone: "/assets/image-monster-medusa-stone-1.png",
} as const;

/** Visible body width from seat center (selfie arm extends right). */
export const MEDUSA_BUBBLE_ANCHOR_WIDTH = 320;

export const MEDUSA_BUBBLE_Y_OFFSET = 100;

export function medusaSpriteCenterAtSeat(seatX: number): Vec2 {
  const bottom =
    COUNTER_TOP_EDGE_Y +
    SLIME_FEET_ABOVE_COUNTER -
    SLIME_DROP_TOWARD_COUNTER;
  return new Vec2(seatX, bottom + MEDUSA_IDLE_NATIVE.height / 2);
}

export function medusaOrderBubbleCenter(seatX: number): Vec2 {
  const sprite = medusaSpriteCenterAtSeat(seatX);
  return bubbleCenterBesideMonster(
    new Vec2(seatX, sprite.y + MEDUSA_BUBBLE_Y_OFFSET),
    MEDUSA_BUBBLE_ANCHOR_WIDTH,
  );
}
