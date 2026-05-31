import type { Scene } from "@babylonjs/core/scene";

import { ACTIVE_SEAT_INDEX } from "../scene/CounterSeat.ts";
import {
  randomArtMonsterAppearance,
  randomDrinkSlot,
  SeatCustomer,
} from "../scene/SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { CounterQueue } from "./CounterQueue.ts";

const FIRST_ARRIVAL_DELAY_MS = 1000;
const ENTRY_SLIDE_DURATION_SEC = 0.65;

/**
 * After the cafe scene loads, spawn the first customer off-screen left into Seat R.
 */
export class CustomerIntroController {
  private busy = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly queue: CounterQueue,
    private readonly roster: SeatCustomer[],
    private readonly onReady: () => void,
  ) {}

  get isBusy(): boolean {
    return this.busy;
  }

  scheduleFirstArrival(delayMs = FIRST_ARRIVAL_DELAY_MS): void {
    this.timeoutId = globalThis.setTimeout(() => {
      this.timeoutId = null;
      void this.runFirstArrival();
    }, delayMs);
    debugLog("CustomerIntro: scheduled first arrival", { delayMs });
  }

  dispose(): void {
    if (this.timeoutId !== null) {
      globalThis.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private async runFirstArrival(): Promise<void> {
    if (this.queue.getActiveCustomer()) {
      debugLog("CustomerIntro: skip — active seat already filled");
      return;
    }

    this.busy = true;
    const appearance = randomArtMonsterAppearance();
    const drinkSlot = randomDrinkSlot();

    debugLog("CustomerIntro: entry start", {
      appearance,
      drinkSlot,
      targetSeat: ACTIVE_SEAT_INDEX,
      entryX: -720,
    });

    const customer = new SeatCustomer(this.scene, {
      seatIndex: ACTIVE_SEAT_INDEX,
      drinkSlot,
      role: "active",
      appearance,
      entryFromLeft: true,
    });

    this.queue.setCustomerAt(ACTIVE_SEAT_INDEX, customer);
    this.roster.push(customer);

    await customer.animateToSeat(ACTIVE_SEAT_INDEX, ENTRY_SLIDE_DURATION_SEC);

    customer.setOrderBubbleStyle("active");
    this.busy = false;
    this.onReady();
    debugLog("CustomerIntro: entry complete", {
      appearance,
      drinkSlot,
      seat: customer.seatIndex,
    });
  }
}
