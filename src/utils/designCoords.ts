import { Vec2 } from "./math.ts";

import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";

/** World center (origin = screen center, Y up) → GUI top-left pixels (Y down). */
export function designCenterToTopLeft(center: Vec2): { left: number; top: number } {
  return {
    left: DESIGN_WIDTH / 2 + center.x,
    top: DESIGN_HEIGHT / 2 - center.y,
  };
}
