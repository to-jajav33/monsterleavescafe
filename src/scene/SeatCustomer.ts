import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { CustomerRage } from "../game/CustomerRage.ts";
import { getDrinkBySlot } from "../game/Drink.ts";
import { PlaceholderMonster } from "../entities/Monster.ts";
import { debugLog } from "../utils/debugLog.ts";
import {
  animateMeshTargets,
  killMeshTweens,
  type MeshMoveTarget,
} from "../utils/animateMeshes.ts";
import { Vec2 } from "../utils/math.ts";

import { SEAT_X, type SeatRole } from "./CounterSeat.ts";
import { OrderBubble, type OrderBubbleStyle } from "./OrderBubble.ts";
import { RageBubble } from "./RageBubble.ts";
import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const MONSTER_CENTER_Y = 5;
const BUBBLE_CENTER_Y = 100;
const EXIT_X = 720;
const ORDER_DEPTH = 0.12;

export type SeatCustomerConfig = {
  seatIndex: number;
  drinkSlot: 1 | 2 | 3;
  role: SeatRole;
};

/**
 * Placeholder monster + order/rage bubbles at a counter seat.
 */
export class SeatCustomer {
  readonly monster: PlaceholderMonster;
  readonly rage: CustomerRage;
  readonly isOccupied = true;

  private readonly scene: Scene;
  private readonly planes: LayoutPlane[] = [];
  private orderBubble: OrderBubble | null = null;
  private rageBubble: RageBubble | null = null;
  private _seatIndex: number;
  private _role: SeatRole;
  private _drinkSlot: 1 | 2 | 3;
  private _rageAngerStarted = false;

  constructor(scene: Scene, config: SeatCustomerConfig) {
    this.scene = scene;
    this._seatIndex = config.seatIndex;
    this._drinkSlot = config.drinkSlot;
    this._role = config.role;

    const x = SEAT_X[this._seatIndex]!;
    const drink = getDrinkBySlot(this._drinkSlot);
    this.monster = new PlaceholderMonster(
      this.isActive ? 22 : 28,
    );
    this.rage = new CustomerRage(this.monster.patienceSeconds);

    debugLog("SeatCustomer", {
      seat: this._seatIndex,
      role: config.role,
      order: drink.shortLabel,
      patience: this.monster.patienceSeconds,
    });

    this.planes.push(
      new LayoutPlane(scene, {
        name: `monster_body_${this._seatIndex}_${drink.slot}`,
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
      `${this._seatIndex}_${drink.slot}`,
      ORDER_DEPTH,
      this.isActive ? "active" : "queue",
    );

    this.rageBubble = new RageBubble(
      scene,
      new Vec2(x, BUBBLE_CENTER_Y),
      `${this._seatIndex}_${drink.slot}`,
      ORDER_DEPTH,
    );
  }

  get seatIndex(): number {
    return this._seatIndex;
  }

  get drinkSlot(): 1 | 2 | 3 {
    return this._drinkSlot;
  }

  get isActive(): boolean {
    return this._role === "active";
  }

  get ragePercent(): number {
    return this.rage.percent;
  }

  get isOrderLocked(): boolean {
    return this.rage.orderLocked;
  }

  get rageAtFull(): boolean {
    return this.rage.atFullRage;
  }

  get rageAngerStarted(): boolean {
    return this._rageAngerStarted;
  }

  setSeat(seatIndex: number, role: SeatRole): void {
    this._seatIndex = seatIndex;
    this._role = role;
  }

  setOrderBubbleStyle(style: OrderBubbleStyle): void {
    this.orderBubble?.setStyle(style);
  }

  tickRage(deltaSeconds: number): void {
    this.rage.tick(deltaSeconds);
    this.rageBubble?.setRagePercent(this.rage.percent);
  }

  /** Called once at 100% rage — burst/strike handled in Phase 3 item 2. */
  beginRageAnger(): void {
    this._rageAngerStarted = true;
  }

  mindChangeOrder(nextSlot: 1 | 2 | 3): void {
    if (this.isOrderLocked || nextSlot === this._drinkSlot) {
      return;
    }
    this._drinkSlot = nextSlot;
    const drink = getDrinkBySlot(nextSlot);
    this.orderBubble?.setDrink(drink);
  }

  resetRage(): void {
    this.rage.reset();
    this._rageAngerStarted = false;
    this.rageBubble?.setRagePercent(0);
  }

  flashServeMatch(): void {
    this.orderBubble?.flashMatch();
  }

  getMoveTargets(): MeshMoveTarget[] {
    const x = SEAT_X[this._seatIndex]!;
    const targets: MeshMoveTarget[] = this.planes.map((plane) => ({
      mesh: plane.mesh,
      x,
      y: MONSTER_CENTER_Y,
    }));
    if (this.orderBubble) {
      targets.push({
        mesh: this.orderBubble.getMesh(),
        x,
        y: BUBBLE_CENTER_Y,
      });
    }
    if (this.rageBubble) {
      targets.push({
        mesh: this.rageBubble.getMesh(),
        x,
        y: BUBBLE_CENTER_Y,
      });
    }
    return targets;
  }

  animateToSeat(seatIndex: number, durationSeconds: number): Promise<void> {
    const x = SEAT_X[seatIndex]!;
    const targets: MeshMoveTarget[] = this.planes.map((plane) => ({
      mesh: plane.mesh,
      x,
      y: MONSTER_CENTER_Y,
    }));
    if (this.orderBubble) {
      targets.push({
        mesh: this.orderBubble.getMesh(),
        x,
        y: BUBBLE_CENTER_Y,
      });
    }
    if (this.rageBubble) {
      targets.push({
        mesh: this.rageBubble.getMesh(),
        x,
        y: BUBBLE_CENTER_Y,
      });
    }
    return animateMeshTargets(targets, {
      duration: durationSeconds,
      ease: "power2.inOut",
    }).then(() => {
      this.orderBubble?.setCenter(x, BUBBLE_CENTER_Y);
      this.rageBubble?.setCenter(x, BUBBLE_CENTER_Y);
    });
  }

  animateExitRight(durationSeconds: number): Promise<void> {
    const targets = this.getMoveTargets().map((t) => ({
      mesh: t.mesh,
      x: EXIT_X,
      y: t.y,
    }));
    return animateMeshTargets(targets, {
      duration: durationSeconds,
      ease: "power2.in",
    });
  }

  private getAnimMeshes() {
    const meshes = this.planes.map((p) => p.mesh);
    if (this.orderBubble) {
      meshes.push(this.orderBubble.getMesh());
    }
    if (this.rageBubble) {
      meshes.push(this.rageBubble.getMesh());
    }
    return meshes;
  }

  dispose(): void {
    killMeshTweens(this.getAnimMeshes());
    this.rageBubble?.dispose();
    this.rageBubble = null;
    this.orderBubble?.dispose();
    this.orderBubble = null;
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }
}

/** Static demo orders for initial counter (L / C / R). */
export const PHASE1_DEMO_CUSTOMERS: readonly SeatCustomerConfig[] = [
  { seatIndex: 0, drinkSlot: 1, role: "queue" },
  { seatIndex: 1, drinkSlot: 2, role: "queue" },
  { seatIndex: 2, drinkSlot: 3, role: "active" },
] as const;

/** Rotating drink slots for window refill at seat L. */
export const SPAWN_DRINK_ROTATION: readonly (1 | 2 | 3)[] = [1, 3, 2, 1, 2, 3] as const;
