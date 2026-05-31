import type { Scene } from "@babylonjs/core/scene";
import type { Observer } from "@babylonjs/core/Misc/observable";

import type { SeatCustomer } from "../scene/SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { CounterQueue } from "./CounterQueue.ts";
import {
  MEDUSA_HIDE_DANGER_SEC,
  MEDUSA_HIDE_EYES_COOLDOWN_SEC,
  MEDUSA_HIDE_REVEAL_SEC,
  MEDUSA_HIDE_TELEGRAPH_SEC,
  randomMedusaHideArmDelaySec,
} from "./medusaHideTiming.ts";

/** Hide event phases — see docs/MEDUSA_HIDE.md */
export type MedusaHidePhase =
  | "idle"
  | "arming"
  | "telegraph"
  | "reveal"
  | "danger"
  | "resolve"
  | "failed";

export type MedusaHideControllerOptions = {
  onStoned: () => void;
};

/**
 * Medusa hide state machine — telegraph → reveal → danger → resolve / stoned fail.
 */
export class MedusaHideController {
  private phase: MedusaHidePhase = "idle";
  private phaseElapsed = 0;
  private armedFor: SeatCustomer | null = null;
  private armDelaySec = 0;
  private subject: SeatCustomer | null = null;
  private playerHiding = false;
  private readonly eventConsumed = new WeakSet<SeatCustomer>();
  private readonly renderObserver: Observer<Scene>;

  constructor(
    private readonly scene: Scene,
    private readonly queue: CounterQueue,
    private readonly options: MedusaHideControllerOptions,
  ) {
    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      const dt = this.scene.getEngine().getDeltaTime() / 1000;
      this.tick(dt);
    });
    debugLog("MedusaHideController ready");
  }

  get currentPhase(): MedusaHidePhase {
    return this.phase;
  }

  /** True while any hide event is in progress (global lock). */
  get isEventActive(): boolean {
    return (
      this.phase !== "idle" &&
      this.phase !== "arming" &&
      this.phase !== "failed"
    );
  }

  get isDangerWindow(): boolean {
    return this.phase === "danger";
  }

  /** Hide button should pulse from telegraph until safe to release. */
  get isHideButtonPulsing(): boolean {
    return (
      this.phase === "telegraph" ||
      this.phase === "reveal" ||
      this.phase === "danger" ||
      this.phase === "resolve"
    );
  }

  get isMedusaEyesRevealed(): boolean {
    return (
      this.phase === "reveal" ||
      this.phase === "danger" ||
      this.phase === "resolve"
    );
  }

  /** Pause all counter patience while the player is ducked. */
  get isPatiencePausedForHide(): boolean {
    return this.playerHiding && this.isEventActive;
  }

  get activeSubject(): SeatCustomer | null {
    return this.subject;
  }

  get isPlayerHiding(): boolean {
    return this.playerHiding;
  }

  /** Wired from Space / Hide hold. */
  setPlayerHiding(hiding: boolean): void {
    if (this.playerHiding === hiding) {
      return;
    }
    this.playerHiding = hiding;
    debugLog("MedusaHide: player hiding", hiding, { phase: this.phase });
  }

  /** Block rage-out on active Medusa during the hide event. */
  blocksRageFor(customer: SeatCustomer): boolean {
    return this.isEventActive && this.subject === customer;
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
    this.resetToIdle();
  }

  private tick(dt: number): void {
    if (this.phase === "failed") {
      return;
    }

    switch (this.phase) {
      case "idle":
        this.tickIdle();
        break;
      case "arming":
        this.tickArming(dt);
        break;
      case "telegraph":
      case "reveal":
      case "danger":
      case "resolve":
        this.tickEvent(dt);
        break;
    }
  }

  private tickIdle(): void {
    if (this.isEventActive) {
      return;
    }

    const active = this.queue.getActiveCustomer();
    if (!active?.isMedusaCustomer) {
      this.armedFor = null;
      return;
    }

    if (this.eventConsumed.has(active)) {
      return;
    }

    this.beginArming(active);
  }

  private beginArming(medusa: SeatCustomer): void {
    this.phase = "arming";
    this.armedFor = medusa;
    this.armDelaySec = randomMedusaHideArmDelaySec();
    this.phaseElapsed = 0;
    debugLog("MedusaHide: arming", {
      seat: medusa.seatIndex,
      delaySec: this.armDelaySec.toFixed(2),
    });
  }

  private tickArming(dt: number): void {
    const active = this.queue.getActiveCustomer();
    if (!active || active !== this.armedFor || !active.isMedusaCustomer) {
      debugLog("MedusaHide: arm cancelled — active Medusa left");
      this.resetToIdle();
      return;
    }

    this.phaseElapsed += dt;
    if (this.phaseElapsed >= this.armDelaySec) {
      this.startEvent(active);
    }
  }

  private startEvent(medusa: SeatCustomer): void {
    this.eventConsumed.add(medusa);
    this.subject = medusa;
    this.playerHiding = false;
    this.phase = "telegraph";
    this.phaseElapsed = 0;
    medusa.setMedusaBodyFrame("idle");
    debugLog("MedusaHide: telegraph", { seat: medusa.seatIndex });
  }

  private tickEvent(dt: number): void {
    const active = this.queue.getActiveCustomer();
    if (!this.subject || active !== this.subject) {
      debugLog("MedusaHide: event aborted — Medusa no longer active");
      this.resetToIdle();
      return;
    }

    this.phaseElapsed += dt;

    switch (this.phase) {
      case "telegraph":
        if (this.phaseElapsed >= MEDUSA_HIDE_TELEGRAPH_SEC) {
          this.enterReveal();
        }
        break;
      case "reveal":
        if (this.phaseElapsed >= MEDUSA_HIDE_REVEAL_SEC) {
          this.enterDanger();
        }
        break;
      case "danger":
        if (this.phaseElapsed >= MEDUSA_HIDE_DANGER_SEC) {
          this.endDangerWindow();
        }
        break;
      case "resolve":
        if (!this.playerHiding) {
          this.failStoned();
          return;
        }
        if (this.phaseElapsed >= MEDUSA_HIDE_EYES_COOLDOWN_SEC) {
          this.completeEvent();
        }
        break;
    }
  }

  private enterReveal(): void {
    this.phase = "reveal";
    this.phaseElapsed = 0;
    this.subject?.setMedusaBodyFrame("eyes");
    debugLog("MedusaHide: reveal (eyes)", {
      alreadyHiding: this.playerHiding,
    });
  }

  private enterDanger(): void {
    this.phase = "danger";
    this.phaseElapsed = 0;
    debugLog("MedusaHide: danger window", {
      alreadyHiding: this.playerHiding,
    });
  }

  private endDangerWindow(): void {
    if (!this.playerHiding) {
      this.failStoned();
      return;
    }

    this.phase = "resolve";
    this.phaseElapsed = 0;
    debugLog("MedusaHide: resolve — hold until eyes idle");
  }

  private failStoned(): void {
    this.phase = "failed";
    this.subject?.setMedusaBodyFrame("stone");
    debugLog("MedusaHide: failed — stoned");
    this.options.onStoned();
  }

  private completeEvent(): void {
    this.subject?.setMedusaBodyFrame("idle");
    debugLog("MedusaHide: complete", { seat: this.subject?.seatIndex });
    this.resetToIdle();
  }

  private resetToIdle(): void {
    this.phase = "idle";
    this.phaseElapsed = 0;
    this.armedFor = null;
    this.armDelaySec = 0;
    this.subject = null;
    this.playerHiding = false;
  }
}
