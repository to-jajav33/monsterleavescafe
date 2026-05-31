import type { Scene } from "@babylonjs/core/scene";

import { ACTIVE_SEAT_INDEX } from "../scene/CounterSeat.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { CounterQueue } from "./CounterQueue.ts";

const EXIT_DURATION_SEC = 0.55;
const SHIFT_DURATION_SEC = 0.45;

/**
 * After serve or rage fail: exit right, shift L→C→R (new arrivals via {@link QueueSpawnController}).
 */
export class LineAdvanceController {
  private busy = false;

  constructor(
    private readonly scene: Scene,
    private readonly queue: CounterQueue,
    private readonly roster: SeatCustomer[],
    private readonly onQueueUpdated: () => void,
  ) {}

  get isBusy(): boolean {
    return this.busy;
  }

  advanceAfterServe(served: SeatCustomer): void {
    if (this.busy) {
      debugLog("LineAdvance: already advancing");
      return;
    }
    this.busy = true;
    void this.runAdvance(served);
  }

  private async runAdvance(served: SeatCustomer): Promise<void> {
    debugLog("LineAdvance: exit start", { seat: served.seatIndex });

    await served.animateExitRight(EXIT_DURATION_SEC);

    const exitSeat = served.seatIndex;
    this.queue.clearSeat(exitSeat);
    served.dispose();
    const rosterIndex = this.roster.indexOf(served);
    if (rosterIndex >= 0) {
      this.roster.splice(rosterIndex, 1);
    }

    const atCenter = this.queue.getCustomerAt(1);
    const atLeft = this.queue.getCustomerAt(0);
    const moves: Promise<void>[] = [];

    if (atCenter) {
      atCenter.setSeat(ACTIVE_SEAT_INDEX, "active");
      this.queue.clearSeat(1);
      this.queue.setCustomerAt(ACTIVE_SEAT_INDEX, atCenter);
      moves.push(atCenter.animateToSeat(ACTIVE_SEAT_INDEX, SHIFT_DURATION_SEC));
    }

    if (atLeft) {
      atLeft.setSeat(1, "queue");
      this.queue.clearSeat(0);
      this.queue.setCustomerAt(1, atLeft);
      moves.push(atLeft.animateToSeat(1, SHIFT_DURATION_SEC));
    }

    await Promise.all(moves);

    this.busy = false;
    this.onQueueUpdated();
    debugLog("LineAdvance: complete", {
      activeOrder: this.queue.getActiveCustomer()?.drinkSlot,
      seats: this.queue.allCustomers.map((c) => ({
        seat: c.seatIndex,
        drink: c.drinkSlot,
        active: c.isActive,
      })),
    });
  }
}
