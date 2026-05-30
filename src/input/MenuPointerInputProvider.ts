import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { Observer } from "@babylonjs/core/Misc/observable";

import type { MenuBoard } from "../scene/MenuBoard.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { InputMap } from "./InputMap.ts";

type PickBinding = {
  slot: 1 | 2 | 3;
  mesh: Mesh;
  downAction: ExecuteCodeAction;
  upAction: ExecuteCodeAction;
};

/**
 * Emits raw pointer pick events on menu slot meshes into the {@link InputMap}.
 */
export class MenuPointerInputProvider {
  private readonly bindings: PickBinding[] = [];
  private pointerDownSlot: 1 | 2 | 3 | null = null;
  private readonly pointerObserver: Observer<unknown>;

  constructor(
    private readonly scene: Scene,
    menuBoard: MenuBoard,
    private readonly inputMap: InputMap,
  ) {
    for (const slot of [1, 2, 3] as const) {
      const mesh = menuBoard.getSlotMesh(slot);
      if (!mesh) {
        debugLog("MenuPointerInputProvider: missing mesh for slot", slot);
        continue;
      }

      if (!mesh.actionManager) {
        mesh.actionManager = new ActionManager(scene);
      }

      const downAction = new ExecuteCodeAction(
        { trigger: ActionManager.OnPickDownTrigger },
        () => {
          this.onPickDown(slot);
        },
      );
      const upAction = new ExecuteCodeAction(
        { trigger: ActionManager.OnPickUpTrigger },
        () => {
          this.onPickUp(slot);
        },
      );
      mesh.actionManager.registerAction(downAction);
      mesh.actionManager.registerAction(upAction);
      this.bindings.push({ slot, mesh, downAction, upAction });
    }

    this.pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
      if (
        pointerInfo.type === PointerEventTypes.POINTERUP &&
        this.pointerDownSlot !== null
      ) {
        this.emitReleased(this.pointerDownSlot);
        this.pointerDownSlot = null;
      }
    });

    debugLog("MenuPointerInputProvider ready", {
      slots: this.bindings.map((b) => b.slot),
    });
  }

  private onPickDown(slot: 1 | 2 | 3): void {
    this.pointerDownSlot = slot;
    this.inputMap.dispatch({
      source: { kind: "menu_pointer", slot },
      phase: "pressed",
    });
  }

  private onPickUp(slot: 1 | 2 | 3): void {
    if (this.pointerDownSlot !== slot) {
      return;
    }
    this.emitReleased(slot);
    this.pointerDownSlot = null;
  }

  private emitReleased(slot: 1 | 2 | 3): void {
    this.inputMap.dispatch({
      source: { kind: "menu_pointer", slot },
      phase: "released",
    });
  }

  dispose(): void {
    this.scene.onPointerObservable.remove(this.pointerObserver);

    for (const { mesh, downAction, upAction } of this.bindings) {
      mesh.actionManager?.unregisterAction(downAction);
      mesh.actionManager?.unregisterAction(upAction);
    }
    this.bindings.length = 0;
    this.pointerDownSlot = null;
  }
}
