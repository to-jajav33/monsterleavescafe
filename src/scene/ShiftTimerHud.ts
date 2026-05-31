import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { formatShiftCountdown, SHIFT_DURATION_SEC } from "../game/shiftTimerFormat.ts";
import { Vec2 } from "../utils/math.ts";

import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const TIMER_CENTER = new Vec2(-520, 300);
const TIMER_W = 160;
const TIMER_H = 56;

/** World-space countdown label (top-left of the cafe frame). */
export class ShiftTimerHud {
  private readonly plane: LayoutPlane;

  constructor(scene: Scene) {
    this.plane = new LayoutPlane(scene, {
      name: "layout_shift_timer",
      center: TIMER_CENTER,
      width: TIMER_W,
      height: TIMER_H,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.shiftTimer,
      alphaIndex: LayoutAlphaIndex.shiftTimer,
      color: new Color3(0.12, 0.1, 0.14),
      label: formatShiftCountdown(SHIFT_DURATION_SEC),
      labelFont: "bold 34px monospace",
      labelTextColor: "#f5e6c8",
      sortTransparent: true,
    });
  }

  setRemainingSeconds(remainingSec: number): void {
    this.plane.updateLabel(formatShiftCountdown(remainingSec));
  }

  dispose(): void {
    this.plane.dispose();
  }
}
