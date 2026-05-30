import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import type { Drink } from "../game/Drink.ts";
import { Vec2 } from "../utils/math.ts";

import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const BUBBLE_SIZE = 88;

/** Speech-style order bubble showing which drink the monster wants. */
export class OrderBubble {
  private readonly plane: LayoutPlane;

  constructor(
    scene: Scene,
    center: Vec2,
    drink: Drink,
    nameSuffix: string,
    depthOffset: number,
  ) {
    this.plane = new LayoutPlane(scene, {
      name: `order_bubble_${nameSuffix}`,
      center,
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      layer: LayoutLayer.seats,
      depthOffset,
      color: new Color3(0.93, 0.93, 0.9),
      label: `${drink.slot}\n${drink.shortLabel}`,
      labelFont: "bold 13px monospace",
      labelTextColor: "#2c2c34",
    });
  }

  dispose(): void {
    this.plane.dispose();
  }
}
