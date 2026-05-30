import type { Scene } from "@babylonjs/core/scene";

import type { MenuBoard } from "../scene/MenuBoard.ts";
import { debugLog } from "../utils/debugLog.ts";

import { DEFAULT_MENU_INPUT_BINDINGS } from "./defaultBindings.ts";
import { InputMap } from "./InputMap.ts";
import { KeyboardInputProvider } from "./KeyboardInputProvider.ts";
import { MenuPointerInputProvider } from "./MenuPointerInputProvider.ts";

/**
 * Wires input providers → {@link InputMap} with default gameplay bindings.
 */
export class SceneInputSystem {
  readonly map: InputMap;
  private readonly keyboard: KeyboardInputProvider;
  private readonly menuPointer: MenuPointerInputProvider;

  constructor(scene: Scene, menuBoard: MenuBoard) {
    this.map = new InputMap();
    this.map.registerAll(DEFAULT_MENU_INPUT_BINDINGS);

    this.keyboard = new KeyboardInputProvider(scene, this.map);
    this.menuPointer = new MenuPointerInputProvider(scene, menuBoard, this.map);

    debugLog("SceneInputSystem ready");
  }

  dispose(): void {
    this.keyboard.dispose();
    this.menuPointer.dispose();
    this.map.clear();
  }
}
