import "@babylonjs/core/Culling/ray";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { Observer } from "@babylonjs/core/Misc/observable";

import type { MedusaHideController } from "../game/MedusaHideController.ts";
import { debugLog } from "../utils/debugLog.ts";

type KeyboardLike = {
  key?: string;
  code?: string;
  keyCode?: number;
  repeat?: boolean;
};

export function isSpaceKey(event: KeyboardLike): boolean {
  if (event.key === " " || event.code === "Space") {
    return true;
  }
  return event.keyCode === 32;
}

/**
 * Hold Space or the Hide button → {@link MedusaHideController.setPlayerHiding}.
 */
export class HideHoldController {
  private spaceHeld = false;
  private buttonHeld = false;
  private readonly canvas: HTMLCanvasElement | null;
  private readonly onCanvasKeyDown: (event: KeyboardEvent) => void;
  private readonly onCanvasKeyUp: (event: KeyboardEvent) => void;
  private readonly pointerObserver: Observer<unknown>;
  private readonly downAction: ExecuteCodeAction;
  private readonly upAction: ExecuteCodeAction;

  constructor(
    private readonly scene: Scene,
    private readonly hideButtonMesh: Mesh,
    private readonly medusaHide: MedusaHideController,
  ) {
    this.canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement | null;

    this.onCanvasKeyDown = (event) => this.handleSpaceKey(event, "down");
    this.onCanvasKeyUp = (event) => this.handleSpaceKey(event, "up");
    this.canvas?.addEventListener("keydown", this.onCanvasKeyDown);
    this.canvas?.addEventListener("keyup", this.onCanvasKeyUp);

    if (!this.hideButtonMesh.actionManager) {
      this.hideButtonMesh.actionManager = new ActionManager(scene);
    }
    this.downAction = new ExecuteCodeAction(
      { trigger: ActionManager.OnPickDownTrigger },
      () => this.setButtonHeld(true),
    );
    this.upAction = new ExecuteCodeAction(
      { trigger: ActionManager.OnPickUpTrigger },
      () => this.setButtonHeld(false),
    );
    this.hideButtonMesh.actionManager.registerAction(this.downAction);
    this.hideButtonMesh.actionManager.registerAction(this.upAction);

    this.pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
      if (
        pointerInfo.type === PointerEventTypes.POINTERUP &&
        this.buttonHeld
      ) {
        this.setButtonHeld(false);
      }
    });

    debugLog("HideHoldController ready (Space + Hide button)");
  }

  dispose(): void {
    this.canvas?.removeEventListener("keydown", this.onCanvasKeyDown);
    this.canvas?.removeEventListener("keyup", this.onCanvasKeyUp);
    this.scene.onPointerObservable.remove(this.pointerObserver);
    this.hideButtonMesh.actionManager?.unregisterAction(this.downAction);
    this.hideButtonMesh.actionManager?.unregisterAction(this.upAction);
    this.spaceHeld = false;
    this.buttonHeld = false;
    this.syncHiding();
  }

  private handleSpaceKey(event: KeyboardEvent, kind: "down" | "up"): void {
    if (!isSpaceKey(event)) {
      return;
    }
    if (kind === "down" && event.repeat) {
      return;
    }
    event.preventDefault();
    this.spaceHeld = kind === "down";
    this.syncHiding();
  }

  private setButtonHeld(held: boolean): void {
    if (this.buttonHeld === held) {
      return;
    }
    this.buttonHeld = held;
    this.syncHiding();
  }

  private syncHiding(): void {
    const holding = this.spaceHeld || this.buttonHeld;
    if (this.medusaHide.isEventActive) {
      this.medusaHide.setPlayerHiding(holding);
      return;
    }
    if (!holding) {
      this.medusaHide.setPlayerHiding(false);
    }
  }
}
