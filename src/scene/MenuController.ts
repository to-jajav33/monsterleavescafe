import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { Observer } from "@babylonjs/core/Misc/observable";

import type { Drink } from "../game/Drink.ts";
import type { ServeResolver } from "../game/ServeResolver.ts";
import type { SeatCustomer } from "./SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { MenuBoard } from "./MenuBoard.ts";
import { MENU_SLOT_HEIGHT, MENU_SLOT_WIDTH } from "./MenuBoard.ts";
import { MenuHoldVisual } from "./MenuHoldVisual.ts";

type SlotBinding = {
  slot: 1 | 2 | 3;
  mesh: Mesh;
  downAction: ExecuteCodeAction;
  upAction: ExecuteCodeAction;
  holdVisual: MenuHoldVisual;
};

type ActiveHold = {
  slot: 1 | 2 | 3;
  customer: SeatCustomer;
  drink: Drink;
  elapsed: number;
  duration: number;
};

/**
 * Hold-to-serve on menu drink slots — Phase 2 item 2.
 * Release early or switch slot cancels; correct hold completes serve on active customer.
 */
export class MenuController {
  private readonly bindings: SlotBinding[] = [];
  private hold: ActiveHold | null = null;
  private readonly renderObserver: Observer<Scene>;
  private readonly pointerObserver: Observer<unknown>;

  constructor(
    private readonly scene: Scene,
    menuBoard: MenuBoard,
    private readonly resolver: ServeResolver,
  ) {
    for (const slot of [1, 2, 3] as const) {
      const mesh = menuBoard.getSlotMesh(slot);
      if (!mesh) {
        debugLog("MenuController: missing mesh for slot", slot);
        continue;
      }

      const drink = menuBoard.getDrinkForSlot(slot);
      if (!mesh.actionManager) {
        mesh.actionManager = new ActionManager(scene);
      }

      const downAction = new ExecuteCodeAction(
        { trigger: ActionManager.OnPickDownTrigger },
        () => {
          this.onSlotDown(slot);
        },
      );
      const upAction = new ExecuteCodeAction(
        { trigger: ActionManager.OnPickUpTrigger },
        () => {
          this.onSlotUp(slot);
        },
      );
      mesh.actionManager.registerAction(downAction);
      mesh.actionManager.registerAction(upAction);

      const holdVisual = new MenuHoldVisual(
        scene,
        mesh,
        MENU_SLOT_WIDTH,
        MENU_SLOT_HEIGHT,
        drink.menuColor,
      );

      this.bindings.push({
        slot,
        mesh,
        downAction,
        upAction,
        holdVisual,
      });
      debugLog("MenuController: hold pick enabled for slot", slot);
    }

    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      this.tickHold();
    });

    this.pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
      if (
        pointerInfo.type === PointerEventTypes.POINTERUP &&
        this.hold !== null
      ) {
        this.cancelHold("released");
      }
    });
  }

  private onSlotDown(slot: 1 | 2 | 3): void {
    this.cancelHold("switched slot");

    const result = this.resolver.evaluateMenuPress(slot);
    if (!result.ok) {
      debugLog("Menu hold rejected:", result.reason);
      return;
    }

    this.hold = {
      slot,
      customer: result.customer,
      drink: result.drink,
      elapsed: 0,
      duration: result.drink.holdDurationSeconds,
    };
    this.getBinding(slot)?.holdVisual.setProgress(0);
    debugLog("Menu hold started", {
      slot,
      drink: result.drink.shortLabel,
      seconds: result.drink.holdDurationSeconds,
    });
  }

  private onSlotUp(slot: 1 | 2 | 3): void {
    if (this.hold?.slot === slot) {
      this.cancelHold("released early");
    }
  }

  private tickHold(): void {
    if (!this.hold) {
      return;
    }

    const dt = this.scene.getEngine().getDeltaTime() / 1000;
    this.hold.elapsed += dt;
    const progress = Math.min(1, this.hold.elapsed / this.hold.duration);
    this.getBinding(this.hold.slot)?.holdVisual.setProgress(progress);

    if (this.hold.elapsed >= this.hold.duration) {
      this.completeHold();
    }
  }

  private completeHold(): void {
    const active = this.hold;
    if (!active) {
      return;
    }

    this.getBinding(active.slot)?.holdVisual.hide();
    this.hold = null;

    active.customer.flashServeMatch();
    debugLog("Serve complete", {
      seat: active.customer.seatIndex,
      drink: active.drink.shortLabel,
      holdSeconds: active.drink.holdDurationSeconds,
    });
  }

  private cancelHold(reason: string): void {
    if (!this.hold) {
      return;
    }

    const slot = this.hold.slot;
    this.getBinding(slot)?.holdVisual.hide();
    this.hold = null;
    debugLog("Menu hold cancelled:", reason);
  }

  private getBinding(slot: 1 | 2 | 3): SlotBinding | undefined {
    return this.bindings.find((b) => b.slot === slot);
  }

  dispose(): void {
    this.cancelHold("dispose");
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
    this.scene.onPointerObservable.remove(this.pointerObserver);

    for (const { mesh, downAction, upAction, holdVisual } of this.bindings) {
      mesh.actionManager?.unregisterAction(downAction);
      mesh.actionManager?.unregisterAction(upAction);
      holdVisual.dispose();
    }
    this.bindings.length = 0;
  }
}
