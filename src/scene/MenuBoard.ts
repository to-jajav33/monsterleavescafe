import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { DRINK_MENU, type Drink } from "../game/Drink.ts";
import { Vec2 } from "../utils/math.ts";

import { LayoutGui } from "./LayoutGui.ts";
import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const MENU_CENTER = new Vec2(-520, -300);
const BOARD_W = 200;
const BOARD_H = 180;
const SLOT_W = 168;
const SLOT_H = 44;
/** Vertical offsets for slots 1–3 (top to bottom). */
const SLOT_Y_OFFSETS = [52, 0, -52] as const;

/** Menu board with three labeled drink slots. */
export class MenuBoard {
  private readonly planes: LayoutPlane[] = [];

  constructor(
    scene: Scene,
    private readonly gui: LayoutGui,
  ) {
    this.planes.push(
      new LayoutPlane(scene, {
        name: "layout_menu_board",
        center: MENU_CENTER,
        width: BOARD_W,
        height: BOARD_H,
        layer: LayoutLayer.ui,
        color: new Color3(0.55, 0.48, 0.36),
      }),
    );

    gui.addLabel({
      text: "Menu",
      center: new Vec2(MENU_CENTER.x, MENU_CENTER.y + 72),
      width: BOARD_W,
      height: 28,
      fontSize: 26,
      fontWeight: "bold",
    });

    for (const drink of DRINK_MENU) {
      this.addDrinkSlot(scene, drink);
    }
  }

  private addDrinkSlot(scene: Scene, drink: Drink): void {
    const yOffset = SLOT_Y_OFFSETS[drink.slot - 1]!;
    const center = new Vec2(MENU_CENTER.x, MENU_CENTER.y + yOffset);

    this.planes.push(
      new LayoutPlane(scene, {
        name: `menu_slot_${drink.slot}`,
        center,
        width: SLOT_W,
        height: SLOT_H,
        layer: LayoutLayer.ui,
        color: drink.menuColor,
      }),
    );

    this.gui.addLabel({
      text: `${drink.slot}  ${drink.shortLabel}`,
      center,
      width: SLOT_W,
      height: SLOT_H,
      fontSize: 16,
      fontWeight: "bold",
    });
  }

  dispose(): void {
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }
}
