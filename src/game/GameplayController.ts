import type { Scene } from "@babylonjs/core/scene";

import type { MenuBoard } from "../scene/MenuBoard.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";
import { MenuController } from "../scene/MenuController.ts";
import { debugLog } from "../utils/debugLog.ts";

import { CounterQueue } from "./CounterQueue.ts";
import { ServeResolver } from "./ServeResolver.ts";

/** Phase 2+ gameplay systems (queue, serve targeting, menu input). */
export class GameplayController {
  private readonly queue: CounterQueue;
  private readonly resolver: ServeResolver;
  private readonly menu: MenuController;

  constructor(scene: Scene, menuBoard: MenuBoard, customers: SeatCustomer[]) {
    this.queue = new CounterQueue(customers);
    this.resolver = new ServeResolver(this.queue);
    this.applyOrderBubbleStyles();
    this.menu = new MenuController(scene, menuBoard, this.resolver);
    debugLog("GameplayController ready", {
      activeSeat: this.queue.getActiveSeatIndex(),
      activeOrder: this.queue.getActiveCustomer()?.drinkSlot,
      queuePreview: this.queue.queueCustomers.map((c) => ({
        seat: c.seatIndex,
        drink: c.drinkSlot,
      })),
    });
  }

  private applyOrderBubbleStyles(): void {
    for (const customer of this.queue.allCustomers) {
      customer.setOrderBubbleStyle(customer.isActive ? "active" : "queue");
    }
  }

  dispose(): void {
    this.menu.dispose();
  }
}
