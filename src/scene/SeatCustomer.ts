import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { CustomerRage } from "../game/CustomerRage.ts";
import { getDrinkBySlot } from "../game/Drink.ts";
import { PlaceholderMonster, SlimeMonster } from "../entities/Monster.ts";
import { debugLog } from "../utils/debugLog.ts";
import { horizSpan } from "../utils/seatLayoutDebug.ts";
import {
  animateMeshTargets,
  killMeshTweens,
  type MeshMoveTarget,
} from "../utils/animateMeshes.ts";
import { Vec2 } from "../utils/math.ts";

import { SEAT_X, type SeatRole } from "./CounterSeat.ts";
import {
  SLIME_DROP_TOWARD_COUNTER,
  SLIME_FEET_ABOVE_COUNTER,
  SLIME_IDLE_NATIVE,
  SLIME_IDLE_URL,
  slimeOrderBubbleY,
  slimeSpriteCenterAtSeat,
} from "./monsterSlimeAssets.ts";
import { COUNTER_TOP_EDGE_Y } from "./sceneAssets.ts";
import { OrderBubble, type OrderBubbleStyle } from "./OrderBubble.ts";
import { RageBubble } from "./RageBubble.ts";
import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const PLACEHOLDER_MONSTER_CENTER_Y = 5;
const PLACEHOLDER_BUBBLE_CENTER_Y = 100;
const PLACEHOLDER_WIDTH = 72;
const PLACEHOLDER_HEIGHT = 85;
const EXIT_X = 720;
const ORDER_DEPTH = 0.12;

export type CustomerAppearance = "placeholder" | "slime_idle";

export type SeatCustomerConfig = {
  seatIndex: number;
  drinkSlot: 1 | 2 | 3;
  role: SeatRole;
  appearance?: CustomerAppearance;
};

/**
 * Customer at a counter seat — placeholder or slime sprite + order/rage bubbles.
 */
export class SeatCustomer {
  readonly monster: PlaceholderMonster | SlimeMonster;
  readonly rage: CustomerRage;
  readonly isOccupied = true;

  private readonly scene: Scene;
  private readonly appearance: CustomerAppearance;
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
    this.appearance =
      config.appearance ??
      (config.seatIndex === 0 ? "slime_idle" : "placeholder");

    const seatX = SEAT_X[this._seatIndex]!;
    const drink = getDrinkBySlot(this._drinkSlot);

    if (this.appearance === "slime_idle") {
      this.monster = new SlimeMonster(28);
    } else {
      this.monster = new PlaceholderMonster(this.isActive ? 22 : 28);
    }

    const { monster: monsterCenter, bubble: orderBubbleCenter } =
      this.centersForSeat(this._seatIndex);

    this.rage = new CustomerRage(this.monster.patienceSeconds);

    const horizontalSpan =
      this.appearance === "slime_idle"
        ? horizSpan(seatX, SLIME_IDLE_NATIVE.width)
        : horizSpan(seatX, PLACEHOLDER_WIDTH);

    debugLog("SeatCustomer.create", {
      seat: this._seatIndex,
      seatName: ["L", "C", "R"][this._seatIndex],
      role: config.role,
      appearance: this.appearance,
      order: drink.shortLabel,
      patience: this.monster.patienceSeconds,
      seatCenterX: seatX,
      monsterCenter: { x: monsterCenter.x, y: monsterCenter.y },
      orderBubbleCenter: {
        x: orderBubbleCenter.x,
        y: orderBubbleCenter.y,
      },
      horizontalSpan,
      planeSize:
        this.appearance === "slime_idle"
          ? SLIME_IDLE_NATIVE
          : { width: PLACEHOLDER_WIDTH, height: PLACEHOLDER_HEIGHT },
      ...(this.appearance === "slime_idle"
        ? {
            feetY:
              COUNTER_TOP_EDGE_Y +
              SLIME_FEET_ABOVE_COUNTER -
              SLIME_DROP_TOWARD_COUNTER,
            spriteTop: monsterCenter.y + SLIME_IDLE_NATIVE.height / 2,
          }
        : {}),
    });

    if (this.appearance === "slime_idle") {
      this.planes.push(
        new LayoutPlane(scene, {
          name: `monster_slime_idle_${this._seatIndex}`,
          center: monsterCenter,
          width: SLIME_IDLE_NATIVE.width,
          height: SLIME_IDLE_NATIVE.height,
          layer: LayoutLayer.seats,
          depthOffset: LayoutZOffset.monsterBody,
          alphaIndex: LayoutAlphaIndex.monsterBody,
          color: new Color3(0.45, 0.72, 0.42),
          imageUrl: SLIME_IDLE_URL,
          imageBlend: "alphablend",
        }),
      );
    } else {
      this.planes.push(
        new LayoutPlane(scene, {
          name: `monster_body_${this._seatIndex}_${drink.slot}`,
          center: monsterCenter,
          width: PLACEHOLDER_WIDTH,
          height: PLACEHOLDER_HEIGHT,
          layer: LayoutLayer.seats,
          depthOffset: LayoutZOffset.monsterBody,
          alphaIndex: LayoutAlphaIndex.monsterBody,
          color: new Color3(0.38, 0.34, 0.48),
          label: "◉",
          labelFont: "bold 36px monospace",
          labelTextColor: "#c8b8e8",
        }),
      );
    }

    this.orderBubble = new OrderBubble(
      scene,
      orderBubbleCenter,
      drink,
      `${this._seatIndex}_${drink.slot}`,
      ORDER_DEPTH,
      this.isActive ? "active" : "queue",
    );

    this.rageBubble = new RageBubble(
      scene,
      orderBubbleCenter,
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

  private centersForSeat(seatIndex: number): {
    monster: Vec2;
    bubble: Vec2;
  } {
    const x = SEAT_X[seatIndex]!;
    if (this.appearance === "slime_idle") {
      const monster = slimeSpriteCenterAtSeat(x);
      return {
        monster,
        bubble: new Vec2(x, slimeOrderBubbleY(monster)),
      };
    }
    return {
      monster: new Vec2(x, PLACEHOLDER_MONSTER_CENTER_Y),
      bubble: new Vec2(x, PLACEHOLDER_BUBBLE_CENTER_Y),
    };
  }

  getMoveTargets(): MeshMoveTarget[] {
    const { monster, bubble } = this.centersForSeat(this._seatIndex);
    const targets: MeshMoveTarget[] = this.planes.map((plane) => ({
      mesh: plane.mesh,
      x: monster.x,
      y: monster.y,
    }));
    if (this.orderBubble) {
      targets.push({
        mesh: this.orderBubble.getMesh(),
        x: bubble.x,
        y: bubble.y,
      });
    }
    if (this.rageBubble) {
      targets.push({
        mesh: this.rageBubble.getMesh(),
        x: bubble.x,
        y: bubble.y,
      });
    }
    return targets;
  }

  animateToSeat(seatIndex: number, durationSeconds: number): Promise<void> {
    const { monster, bubble } = this.centersForSeat(seatIndex);

    const targets: MeshMoveTarget[] = this.planes.map((plane) => ({
      mesh: plane.mesh,
      x: monster.x,
      y: monster.y,
    }));
    if (this.orderBubble) {
      targets.push({
        mesh: this.orderBubble.getMesh(),
        x: bubble.x,
        y: bubble.y,
      });
    }
    if (this.rageBubble) {
      targets.push({
        mesh: this.rageBubble.getMesh(),
        x: bubble.x,
        y: bubble.y,
      });
    }
    return animateMeshTargets(targets, {
      duration: durationSeconds,
      ease: "power2.inOut",
    }).then(() => {
      this.orderBubble?.setCenter(bubble.x, bubble.y);
      this.rageBubble?.setCenter(bubble.x, bubble.y);
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
  { seatIndex: 0, drinkSlot: 1, role: "queue", appearance: "slime_idle" },
  { seatIndex: 1, drinkSlot: 2, role: "queue", appearance: "placeholder" },
  { seatIndex: 2, drinkSlot: 3, role: "active", appearance: "placeholder" },
] as const;

export const SPAWN_DRINK_ROTATION: readonly (1 | 2 | 3)[] = [
  1, 3, 2, 1, 2, 3,
] as const;
