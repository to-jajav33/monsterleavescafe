import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { debugLog } from "../utils/debugLog.ts";

import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";
import {
  FLASHLIGHT_DISPLAY_HEIGHT,
  FLASHLIGHT_DISPLAY_WIDTH,
  FLASHLIGHT_ROTATION_Z,
  FLASHLIGHT_SHELF_CENTER,
  FLASHLIGHT_URL,
} from "./sceneAssets.ts";

/**
 * Flashlight resting on an under-counter shelf — decal for future Hide / backroom pan.
 */
export class CounterFlashlightDecal {
  readonly plane: LayoutPlane;

  constructor(scene: Scene) {
    debugLog("CounterFlashlightDecal.create", {
      url: FLASHLIGHT_URL,
      shelfCenter: {
        x: FLASHLIGHT_SHELF_CENTER.x,
        y: FLASHLIGHT_SHELF_CENTER.y,
      },
      size: {
        width: FLASHLIGHT_DISPLAY_WIDTH,
        height: FLASHLIGHT_DISPLAY_HEIGHT,
      },
      rotationZ: FLASHLIGHT_ROTATION_Z,
    });

    this.plane = new LayoutPlane(scene, {
      name: "layout_flashlight_shelf",
      center: FLASHLIGHT_SHELF_CENTER,
      width: FLASHLIGHT_DISPLAY_WIDTH,
      height: FLASHLIGHT_DISPLAY_HEIGHT,
      layer: LayoutLayer.seats,
      depthOffset: LayoutZOffset.shelfDecal,
      alphaIndex: LayoutAlphaIndex.shelfDecal,
      color: new Color3(0.35, 0.35, 0.38),
      imageUrl: FLASHLIGHT_URL,
      imageBlend: "alphablend",
      rotationZ: FLASHLIGHT_ROTATION_Z,
    });
  }

  dispose(): void {
    this.plane.dispose();
  }
}
