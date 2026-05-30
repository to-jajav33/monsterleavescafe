import type { Scene } from "@babylonjs/core/scene";

import { ACTIVE_SEAT_INDEX } from "../scene/CounterSeat.ts";
import {
  SeatCustomer,
  SPAWN_DRINK_ROTATION,
} from "../scene/SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { CounterQueue } from "./CounterQueue.ts";

const EXIT_DURATION_SEC = 0.55;
const SHIFT_DURATION_SEC = 0.45;

/**
 * After a successful serve: active exits right, line shifts toward Exit, new monster at L.
 */
export class LineAdvanceController {
  private busy = false;
  private spawnIndex = 0;

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

    const drinkSlot = this.nextSpawnDrink();
    const arrival = new SeatCustomer(this.scene, {
      seatIndex: 0,
      drinkSlot,
      role: "queue",
    });
    this.queue.setCustomerAt(0, arrival);
    this.roster.push(arrival);

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

  private nextSpawnDrink(): 1 | 2 | 3 {
    const slot = SPAWN_DRINK_ROTATION[this.spawnIndex % SPAWN_DRINK_ROTATION.length]!;
    this.spawnIndex += 1;
    return slot;
  }
}
