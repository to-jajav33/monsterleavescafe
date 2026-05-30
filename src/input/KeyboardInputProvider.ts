import type { Scene } from "@babylonjs/core/scene";
import {
  KeyboardEventTypes,
  type KeyboardInfo,
} from "@babylonjs/core/Events/keyboardEvents";
import type { Observer } from "@babylonjs/core/Misc/observable";

import { debugLog } from "../utils/debugLog.ts";

import type { InputMap } from "./InputMap.ts";
import type { InputPhase } from "./InputTypes.ts";

const MENU_KEYS = new Set(["1", "2", "3"]);

/**
 * Emits raw keyboard events for 1 / 2 / 3 into the {@link InputMap}.
 */
export class KeyboardInputProvider {
  private readonly observer: Observer<KeyboardInfo>;

  constructor(
    private readonly scene: Scene,
    private readonly inputMap: InputMap,
  ) {
    this.observer = scene.onKeyboardObservable.add((info) => {
      this.onKeyboard(info);
    });
    debugLog("KeyboardInputProvider ready (keys 1, 2, 3)");
  }

  private onKeyboard(info: KeyboardInfo): void {
    const key = info.event.key;
    if (!MENU_KEYS.has(key)) {
      return;
    }

    if (info.type === KeyboardEventTypes.KEYDOWN && info.event.repeat) {
      return;
    }

    let phase: InputPhase | null = null;
    if (info.type === KeyboardEventTypes.KEYDOWN) {
      phase = "pressed";
    } else if (info.type === KeyboardEventTypes.KEYUP) {
      phase = "released";
    }
    if (!phase) {
      return;
    }

    this.inputMap.dispatch({
      source: { kind: "keyboard", key },
      phase,
    });
  }

  dispose(): void {
    this.scene.onKeyboardObservable.remove(this.observer);
  }
}
