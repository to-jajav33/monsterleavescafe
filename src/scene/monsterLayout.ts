import { DESIGN_HEIGHT } from "../game/GameEngine.ts";
import { Vec2 } from "../utils/math.ts";

import {
  LayoutAlphaIndex,
  LayoutLayer,
  LayoutZOffset,
} from "./LayoutLayer.ts";

/**
 * 1280×720 ortho bottom — artist aligns monster feet to the frame bottom in exports.
 * (+Y is up in design space.) Same for every seat; not tied to {@link SEAT_Y}.
 */
export const MONSTER_FRAME_BOTTOM_Y = -DESIGN_HEIGHT / 2;

/** Vertical center for a bottom-anchored sprite (Y does not depend on seat). */
export function monsterSpriteCenterY(spriteHeight: number): number {
  return MONSTER_FRAME_BOTTOM_Y + spriteHeight / 2;
}

/**
 * Art monster plane center: X from seat, Y from frame bottom only.
 *
 * @param seatX — horizontal slot from {@link SEAT_X} (L / C / R)
 * @param spriteHeight — native PNG height (design units)
 */
export function monsterSpriteCenterAtSeat(
  seatX: number,
  spriteHeight: number,
): Vec2 {
  return new Vec2(seatX, monsterSpriteCenterY(spriteHeight));
}

const MONSTER_ALPHA_BY_SEAT = [
  LayoutAlphaIndex.monsterBodySeatL,
  LayoutAlphaIndex.monsterBodySeatC,
  LayoutAlphaIndex.monsterBodySeatR,
] as const;

const MONSTER_Z_OFFSET_BY_SEAT = [
  LayoutZOffset.monsterBodySeatL,
  LayoutZOffset.monsterBodySeatC,
  LayoutZOffset.monsterBodySeatR,
] as const;

/**
 * Transparent-pass stack for overlapping queue art: paint R → C → L
 * (seat R lowest alphaIndex, seat L highest).
 */
export function monsterBodyAlphaIndexForSeat(seatIndex: number): number {
  return MONSTER_ALPHA_BY_SEAT[seatIndex] ?? LayoutAlphaIndex.monsterBody;
}

export function monsterBodyZOffsetForSeat(seatIndex: number): number {
  return MONSTER_Z_OFFSET_BY_SEAT[seatIndex] ?? LayoutZOffset.monsterBody;
}

export function applyMonsterSeatDrawOrder(
  seatIndex: number,
  meshes: { alphaIndex: number; position: { z: number } }[],
): void {
  const alpha = monsterBodyAlphaIndexForSeat(seatIndex);
  const z = LayoutLayer.seats * 0.1 + monsterBodyZOffsetForSeat(seatIndex);
  for (const mesh of meshes) {
    mesh.alphaIndex = alpha;
    mesh.position.z = z;
  }
}
