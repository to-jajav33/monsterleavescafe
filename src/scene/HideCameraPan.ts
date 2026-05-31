import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import type { Scene } from "@babylonjs/core/scene";
import type { Observer } from "@babylonjs/core/Misc/observable";
import gsap from "gsap";

import { debugLog } from "../utils/debugLog.ts";

import { MEDUSA_HIDE_CAMERA_PAN_SEC } from "../game/medusaHideTiming.ts";

import { medusaHideCameraPanY } from "./medusaHideCamera.ts";

/**
 * Pans the ortho camera on Y while the player holds hide (under-counter view).
 */
export class HideCameraPan {
  private readonly originY: number;
  private readonly duckY: number;
  private ducking = false;
  private readonly renderObserver: Observer<Scene>;
  private panTween: gsap.core.Tween | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly camera: FreeCamera,
    private readonly isPlayerHiding: () => boolean,
  ) {
    this.originY = camera.position.y;
    this.duckY = medusaHideCameraPanY();

    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      this.syncToInput();
    });

    debugLog("HideCameraPan ready", {
      originY: this.originY,
      duckY: this.duckY,
      durationSec: MEDUSA_HIDE_CAMERA_PAN_SEC,
    });
  }

  /** Immediate reset (game over / dispose). */
  snapToOrigin(): void {
    this.panTween?.kill();
    this.panTween = null;
    this.ducking = false;
    this.camera.position.y = this.originY;
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
    this.snapToOrigin();
  }

  private syncToInput(): void {
    const wantDuck = this.isPlayerHiding();
    if (wantDuck === this.ducking) {
      return;
    }
    this.ducking = wantDuck;
    this.animateTo(wantDuck ? this.duckY : this.originY);
  }

  private animateTo(targetY: number): void {
    this.panTween?.kill();
    this.panTween = gsap.to(this.camera.position, {
      y: targetY,
      duration: MEDUSA_HIDE_CAMERA_PAN_SEC,
      ease: "power2.inOut",
      onComplete: () => {
        this.panTween = null;
      },
    });
    debugLog("HideCameraPan:", targetY === this.duckY ? "down" : "up");
  }
}
