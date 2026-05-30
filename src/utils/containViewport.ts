import { Viewport } from "@babylonjs/core/Maths/math.viewport";

import { DESIGN_ASPECT } from "../game/GameEngine.ts";

/**
 * CSS object-fit: contain — fit the design aspect inside the canvas,
 * letterboxing/pillarboxing the rest (normalized 0–1 viewport).
 */
export function createContainViewport(
  canvasWidth: number,
  canvasHeight: number,
): Viewport {
  const canvasAspect = canvasWidth / canvasHeight;

  if (canvasAspect > DESIGN_ASPECT) {
    // Wider than design (e.g. ultrawide) → fit height, bars on left/right
    const vw = DESIGN_ASPECT / canvasAspect;
    return new Viewport((1 - vw) / 2, 0, vw, 1);
  }

  // Taller than design (e.g. portrait) → fit width, bars on top/bottom
  const vh = canvasAspect / DESIGN_ASPECT;
  return new Viewport(0, (1 - vh) / 2, 1, vh);
}
