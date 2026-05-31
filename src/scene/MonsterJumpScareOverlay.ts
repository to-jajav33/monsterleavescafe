import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

/** Screen center — jumpscare draws above counter on UI layer. */
const JUMPSCARE_CENTER = new Vec2(0, 0);

export type MonsterJumpScareOverlayConfig = {
  seatIndex: number;
  meshPrefix: string;
  native: { width: number; height: number };
  tint: Color3;
};

/**
 * Full-screen-center jumpscare on {@link LayoutLayer.ui} (over counter art in group 2).
 * Separate from the queue body at the seat.
 */
export class MonsterJumpScareOverlay {
  private plane: LayoutPlane | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly config: MonsterJumpScareOverlayConfig,
  ) {}

  get isVisible(): boolean {
    return this.plane?.mesh.isVisible ?? false;
  }

  show(jumpScareUrl: string): void {
    if (!this.plane) {
      this.plane = new LayoutPlane(this.scene, {
        name: `${this.config.meshPrefix}_jumpscare_${this.config.seatIndex}`,
        center: JUMPSCARE_CENTER,
        width: this.config.native.width,
        height: this.config.native.height,
        layer: LayoutLayer.ui,
        depthOffset: LayoutZOffset.jumpScare,
        alphaIndex: LayoutAlphaIndex.jumpScare,
        color: this.config.tint,
        imageUrl: jumpScareUrl,
        imageBlend: "alphablend",
        sortTransparent: true,
      });
    } else {
      this.plane.setImageUrl(jumpScareUrl);
    }
    this.plane.mesh.isVisible = true;
  }

  hide(): void {
    if (this.plane) {
      this.plane.mesh.isVisible = false;
    }
  }

  dispose(): void {
    this.plane?.dispose();
    this.plane = null;
  }
}
