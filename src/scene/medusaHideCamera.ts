import { DESIGN_HEIGHT } from "../game/GameEngine.ts";

import {
  COUNTER_TOP_EDGE_Y,
  COUNTER_TOP_HEIGHT,
} from "./sceneAssets.ts";

/**
 * Camera Y so the ortho frame bottom aligns with the counter mesh bottom
 * (see docs/MEDUSA_HIDE.md).
 */
export function medusaHideCameraPanY(): number {
  const counterBottomY = COUNTER_TOP_EDGE_Y - COUNTER_TOP_HEIGHT;
  const orthoBottom = -DESIGN_HEIGHT / 2;
  return counterBottomY - orthoBottom;
}
