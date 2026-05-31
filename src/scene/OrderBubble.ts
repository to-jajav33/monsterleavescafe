import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import type { Drink } from "../game/Drink.ts";
import { Vec2 } from "../utils/math.ts";

import {
  LayoutAlphaIndex,
  LayoutLayer,
  LayoutZOffset,
} from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

export const ORDER_BUBBLE_SIZE = 88;

/** Gap between monster right edge and order bubble left edge (design units). */
export const ORDER_BUBBLE_GAP_FROM_MONSTER = 16;

export const BUBBLE_COLORS = {
  active: new Color3(1, 0.97, 0.82),
  queue: new Color3(0.82, 0.84, 0.88),
  match: new Color3(0.75, 0.95, 0.55),
} as const;

export type OrderBubbleStyle = keyof typeof BUBBLE_COLORS;

/** Speech-style order bubble showing which drink the monster wants. */
export class OrderBubble {
  private plane: LayoutPlane;
  private style: OrderBubbleStyle;
  private flashTimer: ReturnType<typeof setTimeout> | null = null;
  private center: Vec2;
  private drink: Drink;

  constructor(
    private readonly scene: Scene,
    center: Vec2,
    drink: Drink,
    private readonly nameSuffix: string,
    private readonly depthOffset: number,
    initialStyle: OrderBubbleStyle,
  ) {
    this.center = center.clone();
    this.drink = drink;
    this.style = initialStyle;
    this.plane = this.createPlane(initialStyle);
  }

  getDrink(): Drink {
    return this.drink;
  }

  setDrink(next: Drink): void {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
    this.drink = next;
    this.plane.dispose();
    this.plane = this.createPlane(this.style);
    this.syncMeshPosition();
  }

  getMesh() {
    return this.plane.mesh;
  }

  getCenter(): Vec2 {
    return this.center.clone();
  }

  setCenter(x: number, y: number): void {
    this.center.x = x;
    this.center.y = y;
    this.syncMeshPosition();
  }

  private syncMeshPosition(): void {
    this.plane.mesh.position.x = this.center.x;
    this.plane.mesh.position.y = this.center.y;
  }

  setStyle(next: OrderBubbleStyle): void {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
    this.style = next;
    this.plane.dispose();
    this.plane = this.createPlane(next);
    this.syncMeshPosition();
  }

  flashMatch(): void {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
    }
    this.plane.dispose();
    this.plane = this.createPlane("match");
    this.syncMeshPosition();
    this.flashTimer = setTimeout(() => {
      this.flashTimer = null;
      this.plane.dispose();
      this.plane = this.createPlane(this.style);
      this.syncMeshPosition();
    }, 220);
  }

  private createPlane(style: OrderBubbleStyle): LayoutPlane {
    return new LayoutPlane(this.scene, {
      name: `order_bubble_${this.nameSuffix}`,
      center: this.center,
      width: ORDER_BUBBLE_SIZE,
      height: ORDER_BUBBLE_SIZE,
      layer: LayoutLayer.seats,
      depthOffset: this.depthOffset,
      alphaIndex: LayoutAlphaIndex.orderBubble,
      sortTransparent: true,
      color: BUBBLE_COLORS[style],
      label: `${this.drink.slot}\n${this.drink.shortLabel}`,
      labelFont: "bold 13px monospace",
      labelTextColor: "#2c2c34",
    });
  }

  dispose(): void {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
    this.plane.dispose();
  }
}
