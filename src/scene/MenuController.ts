import type { Scene } from "@babylonjs/core/scene";
import type { Observer } from "@babylonjs/core/Misc/observable";

import type { Drink } from "../game/Drink.ts";
import type { ServeResolver } from "../game/ServeResolver.ts";
import type { InputMap } from "../input/InputMap.ts";
import { menuSlotActionToSlot } from "../input/InputTypes.ts";
import type { InputSource } from "../input/InputTypes.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { MenuBoard } from "./MenuBoard.ts";
import { MENU_SLOT_HEIGHT, MENU_SLOT_WIDTH } from "./MenuBoard.ts";
import { MenuHoldVisual } from "./MenuHoldVisual.ts";
import type { SeatCustomer } from "./SeatCustomer.ts";

type SlotVisual = {
  slot: 1 | 2 | 3;
  holdVisual: MenuHoldVisual;
};

type ActiveHold = {
  slot: 1 | 2 | 3;
  customer: SeatCustomer;
  drink: Drink;
  elapsed: number;
  duration: number;
  source: InputSource;
};

export type MenuControllerOptions = {
  canServe: () => boolean;
  onServeComplete: (customer: SeatCustomer) => void;
};

/**
 * Hold-to-serve driven by {@link InputMap} actions (menu_slot_1..3).
 * Pointer and keyboard are wired via {@link SceneInputSystem} providers.
 */
export class MenuController {
  private readonly visuals: SlotVisual[] = [];
  private hold: ActiveHold | null = null;
  private readonly renderObserver: Observer<Scene>;
  private readonly unsubscribeAction: () => void;

  constructor(
    private readonly scene: Scene,
    menuBoard: MenuBoard,
    private readonly resolver: ServeResolver,
    inputMap: InputMap,
    private readonly options: MenuControllerOptions,
  ) {
    for (const slot of [1, 2, 3] as const) {
      const mesh = menuBoard.getSlotMesh(slot);
      if (!mesh) {
        debugLog("MenuController: missing mesh for slot", slot);
        continue;
      }

      const drink = menuBoard.getDrinkForSlot(slot);
      this.visuals.push({
        slot,
        holdVisual: new MenuHoldVisual(
          scene,
          mesh,
          MENU_SLOT_WIDTH,
          MENU_SLOT_HEIGHT,
          drink.menuColor,
        ),
      });
    }

    this.unsubscribeAction = inputMap.onAction((action, phase, event) => {
      const slot = menuSlotActionToSlot(action);
      if (phase === "pressed") {
        this.onSlotDown(slot, event.source);
      } else {
        this.onSlotUp(slot, event.source);
      }
    });

    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      this.tickHold();
    });

    debugLog("MenuController listening for menu_slot_1..3 actions");
  }

  private onSlotDown(slot: 1 | 2 | 3, source: InputSource): void {
    if (!this.options.canServe()) {
      debugLog("Menu hold blocked: line advancing");
      return;
    }

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
      source,
    };
    this.getVisual(slot)?.holdVisual.setProgress(0);
    debugLog("Menu hold started", {
      slot,
      drink: result.drink.shortLabel,
      seconds: result.drink.holdDurationSeconds,
      source,
    });
  }

  private onSlotUp(slot: 1 | 2 | 3, _source: InputSource): void {
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
    this.getVisual(this.hold.slot)?.holdVisual.setProgress(progress);

    if (this.hold.elapsed >= this.hold.duration) {
      this.completeHold();
    }
  }

  private completeHold(): void {
    const active = this.hold;
    if (!active) {
      return;
    }

    this.getVisual(active.slot)?.holdVisual.hide();
    this.hold = null;

    active.customer.flashServeMatch();
    debugLog("Serve complete", {
      seat: active.customer.seatIndex,
      drink: active.drink.shortLabel,
      holdSeconds: active.drink.holdDurationSeconds,
    });
    this.options.onServeComplete(active.customer);
  }

  private cancelHold(reason: string): void {
    if (!this.hold) {
      return;
    }

    const slot = this.hold.slot;
    this.getVisual(slot)?.holdVisual.hide();
    this.hold = null;
    debugLog("Menu hold cancelled:", reason);
  }

  private getVisual(slot: 1 | 2 | 3): SlotVisual | undefined {
    return this.visuals.find((v) => v.slot === slot);
  }

  dispose(): void {
    this.cancelHold("dispose");
    this.unsubscribeAction();
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);

    for (const { holdVisual } of this.visuals) {
      holdVisual.dispose();
    }
    this.visuals.length = 0;
  }
}
