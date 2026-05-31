import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

/** Full-frame dim + message when the 3:00 shift ends. */
export class ShiftEndOverlay {
  private readonly planes: LayoutPlane[] = [];
  private visible = false;

  constructor(scene: Scene) {
    this.planes.push(
      new LayoutPlane(scene, {
        name: "layout_shift_end_title",
        center: new Vec2(0, 40),
        width: 520,
        height: 80,
        layer: LayoutLayer.ui,
        depthOffset: LayoutZOffset.shiftTimer + 0.03,
        alphaIndex: LayoutAlphaIndex.shiftEndOverlay,
        color: new Color3(0.18, 0.14, 0.22),
        label: "SHIFT OVER",
        labelFont: "bold 48px monospace",
        labelTextColor: "#f5e6c8",
        sortTransparent: true,
      }),
    );
    this.planes.push(
      new LayoutPlane(scene, {
        name: "layout_shift_end_subtitle",
        center: new Vec2(0, -40),
        width: 480,
        height: 48,
        layer: LayoutLayer.ui,
        depthOffset: LayoutZOffset.shiftTimer + 0.03,
        alphaIndex: LayoutAlphaIndex.shiftEndOverlay,
        color: new Color3(0.14, 0.12, 0.18),
        label: "3:00 — click to continue",
        labelFont: "bold 22px monospace",
        labelTextColor: "#c8b8a0",
        sortTransparent: true,
      }),
    );
    this.setVisible(false);
  }

  show(): void {
    this.setVisible(true);
  }

  private setVisible(visible: boolean): void {
    this.visible = visible;
    for (const plane of this.planes) {
      plane.mesh.isVisible = visible;
    }
  }

  get isVisible(): boolean {
    return this.visible;
  }

  dispose(): void {
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }
}
