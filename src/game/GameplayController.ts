import type { Scene } from "@babylonjs/core/scene";

import { SceneInputSystem } from "../input/SceneInputSystem.ts";
import type { MenuBoard } from "../scene/MenuBoard.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";
import { MenuController } from "../scene/MenuController.ts";
import { debugLog } from "../utils/debugLog.ts";

import { CounterQueue } from "./CounterQueue.ts";
import { CustomerIntroController } from "./CustomerIntroController.ts";
import { LineAdvanceController } from "./LineAdvanceController.ts";
import { RageSystem } from "./RageSystem.ts";
import { ServeResolver } from "./ServeResolver.ts";

/** Phase 2+ gameplay systems (queue, serve targeting, menu input). */
export class GameplayController {
  private readonly queue: CounterQueue;
  private readonly resolver: ServeResolver;
  private readonly lineAdvance: LineAdvanceController;
  private readonly intro: CustomerIntroController;
  private readonly rage: RageSystem;
  private readonly input: SceneInputSystem;
  private readonly menu: MenuController;

  constructor(
    scene: Scene,
    menuBoard: MenuBoard,
    customers: SeatCustomer[],
  ) {
    this.queue = new CounterQueue(customers);
    this.resolver = new ServeResolver(this.queue);
    this.lineAdvance = new LineAdvanceController(
      scene,
      this.queue,
      customers,
      () => {
        this.applyOrderBubbleStyles();
      },
    );
    this.intro = new CustomerIntroController(
      scene,
      this.queue,
      customers,
      () => {
        this.applyOrderBubbleStyles();
      },
    );
    this.applyOrderBubbleStyles();
    this.rage = new RageSystem(scene, this.queue, () => this.isQueueBusy);
    this.input = new SceneInputSystem(scene, menuBoard);
    this.menu = new MenuController(
      scene,
      menuBoard,
      this.resolver,
      this.input.map,
      {
        canServe: () => !this.isQueueBusy,
        onServeComplete: (customer) => {
          this.lineAdvance.advanceAfterServe(customer);
        },
      },
    );

    if (customers.length === 0) {
      this.intro.scheduleFirstArrival();
    }

    debugLog("GameplayController ready", {
      activeSeat: this.queue.getActiveSeatIndex(),
      activeOrder: this.queue.getActiveCustomer()?.drinkSlot,
      queuePreview: this.queue.queueCustomers.map((c) => ({
        seat: c.seatIndex,
        drink: c.drinkSlot,
      })),
      awaitingFirstArrival: customers.length === 0,
    });
  }

  private get isQueueBusy(): boolean {
    return this.lineAdvance.isBusy || this.intro.isBusy;
  }

  private applyOrderBubbleStyles(): void {
    for (const customer of this.queue.allCustomers) {
      customer.setOrderBubbleStyle(customer.isActive ? "active" : "queue");
    }
  }

  dispose(): void {
    this.intro.dispose();
    this.menu.dispose();
    this.rage.dispose();
    this.input.dispose();
  }
}
