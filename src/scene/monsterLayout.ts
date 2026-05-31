import { DESIGN_HEIGHT } from "../game/GameEngine.ts";
import { Vec2 } from "../utils/math.ts";

/**
 * 1280×720 ortho bottom — artist aligns monster feet to the frame bottom in exports.
 * (+Y is up in design space.)
 */
export const MONSTER_FRAME_BOTTOM_Y = -DESIGN_HEIGHT / 2;

/** Bottom-anchored sprite center at a seat X (native height = PNG pixels). */
export function monsterSpriteCenterAtSeat(
  seatX: number,
  spriteHeight: number,
): Vec2 {
  return new Vec2(seatX, MONSTER_FRAME_BOTTOM_Y + spriteHeight / 2);
}
