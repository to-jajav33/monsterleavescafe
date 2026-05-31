import type { Scene } from "@babylonjs/core/scene";

import {
  randomArtMonsterAppearance,
  randomDrinkSlot,
  SeatCustomer,
  SPAWN_DRINK_ROTATION,
} from "../scene/SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { CounterQueue } from "./CounterQueue.ts";
import {
  ENTRY_SLIDE_DURATION_SEC,
  randomSpawnDelayMs,
} from "./queueSpawnTiming.ts";

/**
 * Spawns a customer every 0.5–1.5s into the rightmost open seat (R → C → L).
 */
export class QueueSpawnController {
  private busy = false;
  private stopped = true;
  private spawnIndex = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly queue: CounterQueue,
    private readonly roster: SeatCustomer[],
    private readonly onQueueUpdated: () => void,
    private readonly shouldStop: () => boolean,
  ) {}

  get isBusy(): boolean {
    return this.busy;
  }

  start(): void {
    this.stopped = false;
    debugLog("QueueSpawn: started");
    this.scheduleNext();
  }

  stop(): void {
    this.stopped = true;
    if (this.timeoutId !== null) {
      globalThis.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    debugLog("QueueSpawn: stopped");
  }

  dispose(): void {
    this.stop();
  }

  private scheduleNext(): void {
    if (this.stopped) {
      return;
    }
    const delayMs = randomSpawnDelayMs();
    this.timeoutId = globalThis.setTimeout(() => {
      this.timeoutId = null;
      void this.tick();
    }, delayMs);
  }

  private async tick(): Promise<void> {
    if (this.stopped) {
      return;
    }

    // Keep the timer alive while line advance / other brief pauses run.
    if (this.shouldStop()) {
      this.scheduleNext();
      return;
    }

    if (this.busy) {
      this.scheduleNext();
      return;
    }

    const open = this.queue.findRightmostOpenSeat();
    if (!open) {
      debugLog("QueueSpawn: queue full — wait for open seat");
      this.scheduleNext();
      return;
    }

    this.busy = true;
    try {
      await this.spawnInto(open.seatIndex, open.role);
      this.onQueueUpdated();
    } finally {
      this.busy = false;
      if (!this.stopped) {
        this.scheduleNext();
      }
    }
  }

  /** Try to fill an open seat soon after one opens (e.g. post serve / rage exit). */
  wake(): void {
    if (this.stopped) {
      return;
    }
    if (this.timeoutId !== null) {
      globalThis.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    void this.tick();
  }

  private async spawnInto(
    seatIndex: number,
    role: "active" | "queue",
  ): Promise<void> {
    const drinkSlot = this.nextSpawnDrink();
    const appearance = randomArtMonsterAppearance();

    debugLog("QueueSpawn: arrival", {
      seatIndex,
      role,
      appearance,
      drinkSlot,
    });

    const customer = new SeatCustomer(this.scene, {
      seatIndex,
      drinkSlot,
      role,
      appearance,
      entryFromLeft: true,
    });

    this.queue.setCustomerAt(seatIndex, customer);
    this.roster.push(customer);

    await customer.animateToSeat(seatIndex, ENTRY_SLIDE_DURATION_SEC);

    debugLog("QueueSpawn: arrival complete", { seatIndex, role });
  }

  private nextSpawnDrink(): 1 | 2 | 3 {
    const slot =
      SPAWN_DRINK_ROTATION[this.spawnIndex % SPAWN_DRINK_ROTATION.length]!;
    this.spawnIndex += 1;
    return slot;
  }
}
