import type { Scene } from "@babylonjs/core/scene";
import type { Observer } from "@babylonjs/core/Misc/observable";

import type { ShiftTimerHud } from "../scene/ShiftTimerHud.ts";
import { debugLog } from "../utils/debugLog.ts";

import { SHIFT_DURATION_SEC } from "./shiftTimerFormat.ts";

/**
 * 3:00 shift countdown — ticks down during gameplay and ends the shift at 0:00.
 */
export class ShiftTimer {
  private remainingSec = SHIFT_DURATION_SEC;
  private displayedSec = -1;
  private ended = false;
  private paused = false;
  private readonly renderObserver: Observer<Scene>;

  constructor(
    private readonly scene: Scene,
    private readonly hud: ShiftTimerHud,
    private readonly onShiftEnd: () => void,
  ) {
    this.syncHud();
    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      this.tick();
    });
    debugLog("ShiftTimer ready", { durationSec: SHIFT_DURATION_SEC });
  }

  get isEnded(): boolean {
    return this.ended;
  }

  /** Freeze countdown (e.g. game over overlay). */
  pause(): void {
    this.paused = true;
    this.syncHud();
    debugLog("ShiftTimer: paused", {
      remainingSec: this.remainingSec.toFixed(1),
    });
  }

  private tick(): void {
    if (this.ended || this.paused) {
      return;
    }

    const dt = this.scene.getEngine().getDeltaTime() / 1000;
    this.remainingSec -= dt;
    if (this.remainingSec <= 0) {
      this.remainingSec = 0;
      this.ended = true;
      this.syncHud();
      debugLog("ShiftTimer: shift ended");
      this.onShiftEnd();
      return;
    }

    this.syncHud();
  }

  private syncHud(): void {
    const displaySec = Math.ceil(this.remainingSec);
    if (displaySec === this.displayedSec) {
      return;
    }
    this.displayedSec = displaySec;
    this.hud.setRemainingSeconds(this.remainingSec);
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
  }
}
