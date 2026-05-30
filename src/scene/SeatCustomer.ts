import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { getDrinkBySlot } from "../game/Drink.ts";
import { PlaceholderMonster } from "../entities/Monster.ts";
import { debugLog } from "../utils/debugLog.ts";
import { Vec2 } from "../utils/math.ts";

import { SEAT_X, type SeatRole } from "./CounterSeat.ts";
import { OrderBubble, type OrderBubbleStyle } from "./OrderBubble.ts";
import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const MONSTER_CENTER_Y = 5;
const BUBBLE_CENTER_Y = 100;

export type SeatCustomerConfig = {
  seatIndex: number;
  drinkSlot: 1 | 2 | 3;
  role: SeatRole;
};

/**
 * Placeholder monster + order bubble at a counter seat.
 */
export class SeatCustomer {
  readonly monster: PlaceholderMonster;
  readonly seatIndex: number;
  readonly drinkSlot: 1 | 2 | 3;
  readonly isActive: boolean;
  readonly isOccupied = true;

  private readonly planes: LayoutPlane[] = [];
  private orderBubble: OrderBubble | null = null;

  constructor(
    scene: Scene,
    readonly config: SeatCustomerConfig,
  ) {
    this.seatIndex = config.seatIndex;
    this.drinkSlot = config.drinkSlot;
    this.isActive = config.role === "active";

    const x = SEAT_X[this.seatIndex]!;
    const drink = getDrinkBySlot(this.drinkSlot);
    this.monster = new PlaceholderMonster(
      this.isActive ? 22 : 28,
    );

    debugLog("SeatCustomer", {
      seat: this.seatIndex,
      role: config.role,
      order: drink.shortLabel,
      patience: this.monster.patienceSeconds,
    });

    this.planes.push(
      new LayoutPlane(scene, {
        name: `monster_body_${this.seatIndex}`,
        center: new Vec2(x, MONSTER_CENTER_Y),
        width: 72,
        height: 85,
        layer: LayoutLayer.seats,
        depthOffset: 0.08,
        color: new Color3(0.38, 0.34, 0.48),
        label: "◉",
        labelFont: "bold 36px monospace",
        labelTextColor: "#c8b8e8",
      }),
    );

    this.orderBubble = new OrderBubble(
      scene,
      new Vec2(x, BUBBLE_CENTER_Y),
      drink,
      String(this.seatIndex),
      0.12,
      this.isActive ? "active" : "queue",
    );
  }

  setOrderBubbleStyle(style: OrderBubbleStyle): void {
    this.orderBubble?.setStyle(style);
  }

  flashServeMatch(): void {
    this.orderBubble?.flashMatch();
  }

  dispose(): void {
    this.orderBubble?.dispose();
    this.orderBubble = null;
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }
}

/** Static demo orders for Phase 1 (L / C / R). */
export const PHASE1_DEMO_CUSTOMERS: readonly SeatCustomerConfig[] = [
  { seatIndex: 0, drinkSlot: 1, role: "queue" },
  { seatIndex: 1, drinkSlot: 2, role: "queue" },
  { seatIndex: 2, drinkSlot: 3, role: "active" },
] as const;
