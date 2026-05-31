import { Vec2 } from "../utils/math.ts";

import { monsterSpriteCenterAtSeat } from "./monsterLayout.ts";
import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";

export const BIGFOOT_IDLE_URL = "/assets/image-monster-bigfoot-idle-1.png";

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
  return monsterSpriteCenterAtSeat(seatX, BIGFOOT_IDLE_NATIVE.height);
}

export function bigfootOrderBubbleCenter(seatX: number): Vec2 {
  const sprite = bigfootSpriteCenterAtSeat(seatX);
  return bubbleCenterBesideMonster(
    new Vec2(seatX, sprite.y + BIGFOOT_BUBBLE_Y_OFFSET),
    BIGFOOT_BUBBLE_ANCHOR_WIDTH,
  );
}
