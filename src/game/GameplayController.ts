import type { Scene } from "@babylonjs/core/scene";

import { SceneInputSystem } from "../input/SceneInputSystem.ts";
import type { MenuBoard } from "../scene/MenuBoard.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";
import { MenuController } from "../scene/MenuController.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { LivesHud } from "../scene/LivesHud.ts";
import type { ShiftEndOverlay } from "../scene/ShiftEndOverlay.ts";
import type { ShiftTimerHud } from "../scene/ShiftTimerHud.ts";

import { CounterQueue } from "./CounterQueue.ts";
import { LivesController } from "./LivesController.ts";
import { JUMPSCARE_STRIKE_HOLD_SEC } from "./rageStrikeTiming.ts";
import { CustomerIntroController } from "./CustomerIntroController.ts";
import { LineAdvanceController } from "./LineAdvanceController.ts";
import { RageSystem } from "./RageSystem.ts";
import { ServeResolver } from "./ServeResolver.ts";
import { ShiftTimer } from "./ShiftTimer.ts";

/** Phase 2+ gameplay systems (queue, serve targeting, menu input). */
export class GameplayController {
  private readonly queue: CounterQueue;
  private readonly resolver: ServeResolver;
  private readonly lineAdvance: LineAdvanceController;
  private readonly intro: CustomerIntroController;
  private readonly shiftTimer: ShiftTimer;
  private readonly lives: LivesController;
  private readonly rage: RageSystem;
  private readonly input: SceneInputSystem;
  private readonly menu: MenuController;
  private readonly shiftEndOverlay: ShiftEndOverlay;
  private readonly rageStrikeApplied = new WeakSet<SeatCustomer>();
  private runLost = false;

  constructor(
    scene: Scene,
    menuBoard: MenuBoard,
    customers: SeatCustomer[],
    shiftTimerHud: ShiftTimerHud,
    shiftEndOverlay: ShiftEndOverlay,
    livesHud: LivesHud,
  ) {
    this.shiftEndOverlay = shiftEndOverlay;
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
    this.lives = new LivesController(livesHud);
    this.shiftTimer = new ShiftTimer(scene, shiftTimerHud, () => {
      this.runLost = true;
      shiftEndOverlay.show();
      debugLog("GameplayController: shift ended — input frozen");
    });
    this.rage = new RageSystem(
      scene,
      this.queue,
      () => this.isGameplayPaused,
      (customer) => this.handleRageStrike(customer),
    );
    this.input = new SceneInputSystem(scene, menuBoard);
    this.menu = new MenuController(
      scene,
      menuBoard,
      this.resolver,
      this.input.map,
      {
        canServe: () => this.canPlay,
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

  private get canPlay(): boolean {
    return !this.runLost && !this.shiftTimer.isEnded && !this.isQueueBusy;
  }

  private get isGameplayPaused(): boolean {
    return this.runLost || this.shiftTimer.isEnded || this.isQueueBusy;
  }

  private handleRageStrike(customer: SeatCustomer): void {
    if (this.runLost || this.rageStrikeApplied.has(customer)) {
      return;
    }
    this.rageStrikeApplied.add(customer);

    const outOfLives = this.lives.loseLife();
    debugLog("GameplayController: rage strike", {
      seat: customer.seatIndex,
      livesRemaining: this.lives.livesRemaining,
      outOfLives,
    });

    globalThis.setTimeout(() => {
      if (outOfLives) {
        this.runLost = true;
        customer.clearRageOutPresentation();
        this.shiftEndOverlay.showOutOfLives();
        debugLog("GameplayController: out of lives — game over");
        return;
      }

      if (this.lineAdvance.isBusy) {
        customer.clearRageOutPresentation();
        return;
      }
      customer.clearRageOutPresentation();
      this.lineAdvance.advanceAfterServe(customer);
    }, JUMPSCARE_STRIKE_HOLD_SEC * 1000);
  }

  private applyOrderBubbleStyles(): void {
    for (const customer of this.queue.allCustomers) {
      customer.setOrderBubbleStyle(customer.isActive ? "active" : "queue");
    }
  }

  dispose(): void {
    this.shiftTimer.dispose();
    this.intro.dispose();
    this.menu.dispose();
    this.rage.dispose();
    this.input.dispose();
  }
}
