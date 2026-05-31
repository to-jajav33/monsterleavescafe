import { Vec2 } from "../utils/math.ts";

import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";
import {
  SLIME_DROP_TOWARD_COUNTER,
  SLIME_FEET_ABOVE_COUNTER,
} from "./monsterSlimeAssets.ts";
import { COUNTER_TOP_EDGE_Y } from "./sceneAssets.ts";

export const BIGFOOT_IDLE_URL = "/assets/image-monster-bigfoot-idle-1.png";

/** Native export size — matches slime/medusa artboard (1320×743). */
export const BIGFOOT_IDLE_NATIVE = {
  width: 1320,
  height: 743,
} as const;

export const BIGFOOT_IDLE_FRAMES = {
  idle: BIGFOOT_IDLE_URL,
  angry1: "/assets/image-monster-bigfoot-angry-1.png",
  angry2: "/assets/image-monster-bigfoot-angry-2.png",
  jumpScare: "/assets/image-monster-bigfoot-jumpscare-1.png",
} as const;

export const BIGFOOT_BUBBLE_ANCHOR_WIDTH = 300;

export const BIGFOOT_BUBBLE_Y_OFFSET = 80;

export function bigfootSpriteCenterAtSeat(seatX: number): Vec2 {
  const bottom =
    COUNTER_TOP_EDGE_Y +
    SLIME_FEET_ABOVE_COUNTER -
    SLIME_DROP_TOWARD_COUNTER;
  return new Vec2(seatX, bottom + BIGFOOT_IDLE_NATIVE.height / 2);
}

export function bigfootOrderBubbleCenter(seatX: number): Vec2 {
  const sprite = bigfootSpriteCenterAtSeat(seatX);
  return bubbleCenterBesideMonster(
    new Vec2(seatX, sprite.y + BIGFOOT_BUBBLE_Y_OFFSET),
    BIGFOOT_BUBBLE_ANCHOR_WIDTH,
  );
}
