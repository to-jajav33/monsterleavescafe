import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

import type { ServeResolver } from "../game/ServeResolver.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { MenuBoard } from "./MenuBoard.ts";

type SlotBinding = {
  slot: 1 | 2 | 3;
  mesh: Mesh;
  action: ExecuteCodeAction;
};

/**
 * Pointer input on menu drink slots — Phase 2 item 1 (targeting only, no hold yet).
 */
export class MenuController {
  private readonly bindings: SlotBinding[] = [];

  constructor(
    scene: Scene,
    menuBoard: MenuBoard,
    private readonly resolver: ServeResolver,
  ) {
    for (const slot of [1, 2, 3] as const) {
      const mesh = menuBoard.getSlotMesh(slot);
      if (!mesh) {
        debugLog("MenuController: missing mesh for slot", slot);
        continue;
      }

      if (!mesh.actionManager) {
        mesh.actionManager = new ActionManager(scene);
      }

      const action = new ExecuteCodeAction(
        {
          trigger: ActionManager.OnPickDownTrigger,
        },
        () => {
          this.onSlotPressed(slot);
        },
      );
      mesh.actionManager.registerAction(action);
      this.bindings.push({ slot, mesh, action });
      debugLog("MenuController: pick enabled for slot", slot);
    }
  }

  private onSlotPressed(slot: 1 | 2 | 3): void {
    const result = this.resolver.evaluateMenuPress(slot);
    if (result.ok) {
      result.customer.flashServeMatch();
    } else {
      debugLog("Menu press rejected:", result.reason);
    }
  }

  dispose(): void {
    for (const { mesh, action } of this.bindings) {
      mesh.actionManager?.unregisterAction(action);
    }
    this.bindings.length = 0;
  }
}
