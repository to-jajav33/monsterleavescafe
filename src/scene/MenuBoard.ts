import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { DRINK_MENU, getDrinkBySlot, type Drink } from "../game/Drink.ts";
import { debugLog } from "../utils/debugLog.ts";
import { Vec2 } from "../utils/math.ts";

import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

/** Bottom-left on counter — above clip edge (design bottom = -360). */
const MENU_CENTER = new Vec2(-480, -230);
const BOARD_W = 200;
const BOARD_H = 190;
export const MENU_SLOT_WIDTH = 168;
export const MENU_SLOT_HEIGHT = 44;
const SLOT_W = MENU_SLOT_WIDTH;
const SLOT_H = MENU_SLOT_HEIGHT;
const SLOT_CENTERS = [
  new Vec2(MENU_CENTER.x, MENU_CENTER.y + 52),
  new Vec2(MENU_CENTER.x, MENU_CENTER.y + 4),
  new Vec2(MENU_CENTER.x, MENU_CENTER.y - 44),
] as const;

/** Menu board + three drink slots (slots render above the board panel). */
export class MenuBoard {
  private readonly planes: LayoutPlane[] = [];
  private readonly slotPlanes = new Map<1 | 2 | 3, LayoutPlane>();

  constructor(scene: Scene) {
    debugLog("MenuBoard.build start", {
      drinkCount: DRINK_MENU.length,
      menuCenter: { x: MENU_CENTER.x, y: MENU_CENTER.y },
    });

    this.planes.push(
      new LayoutPlane(scene, {
        name: "layout_menu_board",
        center: MENU_CENTER,
        width: BOARD_W,
        height: BOARD_H,
        layer: LayoutLayer.ui,
        depthOffset: 0,
        color: new Color3(0.55, 0.48, 0.36),
      }),
    );

    this.planes.push(
      new LayoutPlane(scene, {
        name: "layout_menu_title",
        center: new Vec2(MENU_CENTER.x, MENU_CENTER.y + 78),
        width: BOARD_W,
        height: 32,
        layer: LayoutLayer.ui,
        depthOffset: 0.01,
        color: new Color3(0.48, 0.42, 0.32),
        label: "Menu",
        labelFont: "bold 24px monospace",
      }),
    );

    for (const drink of DRINK_MENU) {
      this.addDrinkSlot(scene, drink);
    }

    debugLog("MenuBoard.build done", { planeCount: this.planes.length });
  }

  getSlotMesh(slot: 1 | 2 | 3): Mesh | undefined {
    return this.slotPlanes.get(slot)?.mesh;
  }

  getDrinkForSlot(slot: 1 | 2 | 3): Drink {
    return getDrinkBySlot(slot);
  }

  get planeCount(): number {
    return this.planes.length;
  }

  private addDrinkSlot(scene: Scene, drink: Drink): void {
    const plane = new LayoutPlane(scene, {
      name: `menu_slot_${drink.slot}`,
      center: SLOT_CENTERS[drink.slot - 1]!,
      width: SLOT_W,
      height: SLOT_H,
      layer: LayoutLayer.ui,
      depthOffset: 0.02 + drink.slot * 0.01,
      color: drink.menuColor,
      label: `${drink.slot}  ${drink.shortLabel}`,
      labelFont: "bold 17px monospace",
      pickable: true,
    });
    this.slotPlanes.set(drink.slot, plane);
    this.planes.push(plane);
  }

  dispose(): void {
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
    this.slotPlanes.clear();
  }
}
