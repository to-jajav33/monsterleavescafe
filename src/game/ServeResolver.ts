import type { Drink } from "./Drink.ts";
import { getDrinkBySlot } from "./Drink.ts";
import type { CounterQueue } from "./CounterQueue.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";

import { debugLog } from "../utils/debugLog.ts";

export type ServePressResult =
  | { ok: true; customer: SeatCustomer; drink: Drink }
  | { ok: false; reason: string };

/**
 * Resolves menu input — only the active (Exit-side) customer can be served.
 */
export class ServeResolver {
  constructor(private readonly queue: CounterQueue) {}

  evaluateMenuPress(drinkSlot: 1 | 2 | 3): ServePressResult {
    const active = this.queue.getActiveCustomer();
    if (!active) {
      return { ok: false, reason: "No active customer at counter." };
    }

    if (!active.isActive) {
      return {
        ok: false,
        reason: "Internal error: active seat customer missing active flag.",
      };
    }

    if (active.drinkSlot !== drinkSlot) {
      const wanted = getDrinkBySlot(active.drinkSlot);
      const pressed = getDrinkBySlot(drinkSlot);
      debugLog("ServeResolver.reject", {
        activeSeat: active.seatIndex,
        wanted: wanted.shortLabel,
        pressed: pressed.shortLabel,
      });
      return {
        ok: false,
        reason: `Active customer (Seat ${seatLabel(active.seatIndex)}) wants ${wanted.shortLabel}, not ${pressed.shortLabel}.`,
      };
    }

    const drink = getDrinkBySlot(drinkSlot);
    debugLog("ServeResolver.accept", {
      activeSeat: active.seatIndex,
      drink: drink.shortLabel,
    });
    return { ok: true, customer: active, drink };
  }
}

function seatLabel(index: number): string {
  return index === 0 ? "L" : index === 1 ? "C" : "R";
}
