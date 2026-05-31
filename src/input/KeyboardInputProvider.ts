import type { Scene } from "@babylonjs/core/scene";

import { debugLog } from "../utils/debugLog.ts";

import type { InputMap } from "./InputMap.ts";
import type { InputPhase } from "./InputTypes.ts";

const MENU_KEYS = new Set(["1", "2", "3"]);

type KeyboardLike = {
  key?: string;
  code?: string;
  keyCode?: number;
  repeat?: boolean;
};

/** Map DOM / Babylon keyboard events to menu keys 1–3. */
export function menuKeyFromKeyboardEvent(event: KeyboardLike): string | null {
  const key = event.key;
  if (key && MENU_KEYS.has(key)) {
    return key;
  }

  switch (event.code) {
    case "Digit1":
    case "Numpad1":
      return "1";
    case "Digit2":
    case "Numpad2":
      return "2";
    case "Digit3":
    case "Numpad3":
      return "3";
  }

  switch (event.keyCode) {
    case 49:
    case 97:
      return "1";
    case 50:
    case 98:
      return "2";
    case 51:
    case 99:
      return "3";
  }

  return null;
}

/**
 * Emits raw keyboard events for 1 / 2 / 3 into the {@link InputMap}.
 * Listens on the render canvas so keys work whenever the game has focus.
 */
export class KeyboardInputProvider {
  private readonly canvas: HTMLCanvasElement | null;
  private readonly onCanvasKeyDown: (event: KeyboardEvent) => void;
  private readonly onCanvasKeyUp: (event: KeyboardEvent) => void;

  constructor(
    scene: Scene,
    private readonly inputMap: InputMap,
  ) {
    this.canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement | null;

    this.onCanvasKeyDown = (event) => this.handleDomKey(event, "pressed");
    this.onCanvasKeyUp = (event) => this.handleDomKey(event, "released");
    this.canvas?.addEventListener("keydown", this.onCanvasKeyDown);
    this.canvas?.addEventListener("keyup", this.onCanvasKeyUp);

    if (!scene.isDisposed) {
      scene.attachControl();
    }

    debugLog("KeyboardInputProvider ready (keys 1, 2, 3)", {
      canvas: this.canvas?.id ?? null,
    });
  }

  private handleDomKey(event: KeyboardEvent, phase: InputPhase): void {
    if (phase === "pressed" && event.repeat) {
      return;
    }
    this.dispatchFromEvent(event, phase);
  }

  private dispatchFromEvent(event: KeyboardLike, phase: InputPhase): void {
    const key = menuKeyFromKeyboardEvent(event);
    if (!key) {
      return;
    }

    this.inputMap.dispatch({
      source: { kind: "keyboard", key },
      phase,
    });
  }

  dispose(): void {
    this.canvas?.removeEventListener("keydown", this.onCanvasKeyDown);
    this.canvas?.removeEventListener("keyup", this.onCanvasKeyUp);
  }
}
