import type { Scene } from "@babylonjs/core/scene";
import type { Observer } from "@babylonjs/core/Misc/observable";

import { pickRandomDrinkSlotExcept } from "./Drink.ts";
import type { CounterQueue } from "./CounterQueue.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

/** Seconds between mind-change roll attempts while rage &lt; 50%. */
const MIND_CHANGE_INTERVAL_SEC = 4;
/** Chance per interval to reroll order. */
const MIND_CHANGE_CHANCE = 0.14;

/**
 * Phase 3 — rage growth on all counter customers + mind-change before 50% rage.
 */
export class RageSystem {
  private readonly renderObserver: Observer<Scene>;
  private readonly mindChangeTimers = new WeakMap<SeatCustomer, number>();

  constructor(
    private readonly scene: Scene,
    private readonly queue: CounterQueue,
    private readonly isPaused: () => boolean,
  ) {
    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      this.tick();
    });
    debugLog("RageSystem ready");
  }

  private tick(): void {
    if (this.isPaused()) {
      return;
    }

    const dt = this.scene.getEngine().getDeltaTime() / 1000;
    for (const customer of this.queue.allCustomers) {
      const wasLocked = customer.isOrderLocked;
      customer.tickRage(dt);
      this.tryMindChange(customer, dt);

      if (!wasLocked && customer.isOrderLocked) {
        debugLog("RageSystem: order locked", {
          seat: customer.seatIndex,
          rage: customer.ragePercent.toFixed(2),
        });
      }

      if (customer.rageAtFull && !customer.rageAngerStarted) {
        customer.beginRageAnger();
        debugLog("RageSystem: 100% rage (anger next phase)", {
          seat: customer.seatIndex,
        });
      }
    }
  }

  private tryMindChange(customer: SeatCustomer, dt: number): void {
    if (customer.isOrderLocked || customer.rageAtFull) {
      return;
    }

    let cooldown = this.mindChangeTimers.get(customer) ?? 0;
    cooldown -= dt;
    if (cooldown > 0) {
      this.mindChangeTimers.set(customer, cooldown);
      return;
    }

    this.mindChangeTimers.set(customer, MIND_CHANGE_INTERVAL_SEC);

    if (Math.random() >= MIND_CHANGE_CHANCE) {
      return;
    }

    const nextSlot = pickRandomDrinkSlotExcept(customer.drinkSlot);
    customer.mindChangeOrder(nextSlot);
    debugLog("RageSystem: mind-change", {
      seat: customer.seatIndex,
      newSlot: nextSlot,
      rage: customer.ragePercent.toFixed(2),
    });
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
  }
}
