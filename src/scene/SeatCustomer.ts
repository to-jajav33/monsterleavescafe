import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { CustomerRage } from "../game/CustomerRage.ts";
import { getDrinkBySlot } from "../game/Drink.ts";
import {
  BigfootMonster,
  MedusaMonster,
  PlaceholderMonster,
  SlimeMonster,
} from "../entities/Monster.ts";
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
  BIGFOOT_IDLE_NATIVE,
  BIGFOOT_IDLE_URL,
  bigfootOrderBubbleCenter,
  bigfootSpriteCenterAtSeat,
} from "./monsterBigfootAssets.ts";
import {
  MEDUSA_IDLE_NATIVE,
  MEDUSA_IDLE_URL,
  medusaOrderBubbleCenter,
  medusaSpriteCenterAtSeat,
} from "./monsterMedusaAssets.ts";
import {
  applyMonsterSeatDrawOrder,
  MONSTER_FRAME_BOTTOM_Y,
  monsterBodyAlphaIndexForSeat,
  monsterBodyZOffsetForSeat,
} from "./monsterLayout.ts";
import {
  checkMonsterBottomAlignment,
  logMonsterBottomAlignment,
} from "./monsterLayoutDebug.ts";
import {
  SLIME_IDLE_NATIVE,
  SLIME_IDLE_URL,
  slimeOrderBubbleCenter,
  slimeSpriteCenterAtSeat,
} from "./monsterSlimeAssets.ts";
import { bubbleCenterBesideMonster } from "./orderBubbleLayout.ts";
import { OrderBubble, type OrderBubbleStyle } from "./OrderBubble.ts";
import { RageBubble } from "./RageBubble.ts";
import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const PLACEHOLDER_MONSTER_CENTER_Y = 5;
const PLACEHOLDER_BUBBLE_ANCHOR_Y = 100;
const PLACEHOLDER_WIDTH = 72;
const PLACEHOLDER_HEIGHT = 85;
const EXIT_X = 720;
const ORDER_DEPTH = LayoutZOffset.orderBubble;

export type CustomerAppearance =
  | "placeholder"
  | "slime_idle"
  | "medusa_idle"
  | "bigfoot_idle";

export type SeatCustomerConfig = {
  seatIndex: number;
  drinkSlot: 1 | 2 | 3;
  role: SeatRole;
  appearance?: CustomerAppearance;
};

type ArtMonsterConfig = {
  native: { width: number; height: number };
  idleUrl: string;
  meshPrefix: string;
  tint: Color3;
  spriteCenterAtSeat: (seatX: number) => Vec2;
  orderBubbleCenter: (seatX: number) => Vec2;
};

const ART_MONSTERS: Record<
  "slime_idle" | "medusa_idle" | "bigfoot_idle",
  ArtMonsterConfig
> = {
  slime_idle: {
    native: SLIME_IDLE_NATIVE,
    idleUrl: SLIME_IDLE_URL,
    meshPrefix: "monster_slime_idle",
    tint: new Color3(0.45, 0.72, 0.42),
    spriteCenterAtSeat: slimeSpriteCenterAtSeat,
    orderBubbleCenter: slimeOrderBubbleCenter,
  },
  medusa_idle: {
    native: MEDUSA_IDLE_NATIVE,
    idleUrl: MEDUSA_IDLE_URL,
    meshPrefix: "monster_medusa_idle",
    tint: new Color3(0.52, 0.68, 0.48),
    spriteCenterAtSeat: medusaSpriteCenterAtSeat,
    orderBubbleCenter: medusaOrderBubbleCenter,
  },
  bigfoot_idle: {
    native: BIGFOOT_IDLE_NATIVE,
    idleUrl: BIGFOOT_IDLE_URL,
    meshPrefix: "monster_bigfoot_idle",
    tint: new Color3(0.48, 0.4, 0.32),
    spriteCenterAtSeat: bigfootSpriteCenterAtSeat,
    orderBubbleCenter: bigfootOrderBubbleCenter,
  },
};

function defaultAppearance(seatIndex: number): CustomerAppearance {
  if (seatIndex === 0) return "slime_idle";
  if (seatIndex === 1) return "medusa_idle";
  if (seatIndex === 2) return "bigfoot_idle";
  return "placeholder";
}

function isArtMonster(
  appearance: CustomerAppearance,
): appearance is "slime_idle" | "medusa_idle" | "bigfoot_idle" {
  return (
    appearance === "slime_idle" ||
    appearance === "medusa_idle" ||
    appearance === "bigfoot_idle"
  );
}

/**
 * Customer at a counter seat — art sprite or placeholder + order/rage bubbles.
 */
export class SeatCustomer {
  readonly monster:
    | PlaceholderMonster
    | SlimeMonster
    | MedusaMonster
    | BigfootMonster;
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
      config.appearance ?? defaultAppearance(config.seatIndex);

    const seatX = SEAT_X[this._seatIndex]!;
    const drink = getDrinkBySlot(this._drinkSlot);

    if (this.appearance === "slime_idle") {
      this.monster = new SlimeMonster(28);
    } else if (this.appearance === "medusa_idle") {
      this.monster = new MedusaMonster(28);
    } else if (this.appearance === "bigfoot_idle") {
      this.monster = new BigfootMonster(this.isActive ? 22 : 28);
    } else {
      this.monster = new PlaceholderMonster(this.isActive ? 22 : 28);
    }

    const { monster: monsterCenter, bubble: orderBubbleCenter } =
      this.centersForSeat(this._seatIndex);

    this.rage = new CustomerRage(this.monster.patienceSeconds);

    const art = isArtMonster(this.appearance)
      ? ART_MONSTERS[this.appearance]
      : null;

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
      horizontalSpan: art
        ? horizSpan(seatX, art.native.width)
        : horizSpan(seatX, PLACEHOLDER_WIDTH),
      planeSize: art?.native ?? {
        width: PLACEHOLDER_WIDTH,
        height: PLACEHOLDER_HEIGHT,
      },
      ...(art
        ? {
            frameBottomY: MONSTER_FRAME_BOTTOM_Y,
            spriteTop: monsterCenter.y + art.native.height / 2,
          }
        : {}),
    });

    if (art) {
      this.planes.push(
        new LayoutPlane(scene, {
          name: `${art.meshPrefix}_${this._seatIndex}`,
          center: monsterCenter,
          width: art.native.width,
          height: art.native.height,
          layer: LayoutLayer.seats,
          depthOffset: monsterBodyZOffsetForSeat(this._seatIndex),
          alphaIndex: monsterBodyAlphaIndexForSeat(this._seatIndex),
          color: art.tint,
          imageUrl: art.idleUrl,
          imageBlend: "alphablend",
        }),
      );
      logMonsterBottomAlignment(
        checkMonsterBottomAlignment(
          this.planes[this.planes.length - 1]!.mesh,
          art.native.height,
          seatX,
          this._seatIndex,
        ),
      );
    } else {
      this.planes.push(
        new LayoutPlane(scene, {
          name: `monster_body_${this._seatIndex}_${drink.slot}`,
          center: monsterCenter,
          width: PLACEHOLDER_WIDTH,
          height: PLACEHOLDER_HEIGHT,
          layer: LayoutLayer.seats,
          depthOffset: monsterBodyZOffsetForSeat(this._seatIndex),
          alphaIndex: monsterBodyAlphaIndexForSeat(this._seatIndex),
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
    this.syncSeatDrawOrder();
  }

  /** R → C → L paint order when queue shifts (see monsterLayout.ts). */
  private syncSeatDrawOrder(): void {
    applyMonsterSeatDrawOrder(
      this._seatIndex,
      this.planes.map((p) => p.mesh),
    );
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

  /** X follows seat index; art monster Y is frame-bottom only (see monsterLayout.ts). */
  private centersForSeat(seatIndex: number): {
    monster: Vec2;
    bubble: Vec2;
  } {
    const seatX = SEAT_X[seatIndex]!;
    if (isArtMonster(this.appearance)) {
      const art = ART_MONSTERS[this.appearance];
      return {
        monster: art.spriteCenterAtSeat(seatX),
        bubble: art.orderBubbleCenter(seatX),
      };
    }
    const monster = new Vec2(seatX, PLACEHOLDER_MONSTER_CENTER_Y);
    return {
      monster,
      bubble: bubbleCenterBesideMonster(
        new Vec2(seatX, PLACEHOLDER_BUBBLE_ANCHOR_Y),
        PLACEHOLDER_WIDTH,
      ),
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
      this._seatIndex = seatIndex;
      this.syncSeatDrawOrder();
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
  { seatIndex: 1, drinkSlot: 2, role: "queue", appearance: "medusa_idle" },
  { seatIndex: 2, drinkSlot: 3, role: "active", appearance: "bigfoot_idle" },
] as const;

export const SPAWN_DRINK_ROTATION: readonly (1 | 2 | 3)[] = [
  1, 3, 2, 1, 2, 3,
] as const;
