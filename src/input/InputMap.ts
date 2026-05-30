import { debugLog } from "../utils/debugLog.ts";

import type {
  ActionListener,
  InputBinding,
  InputPhase,
  MenuSlotAction,
  RawInputEvent,
} from "./InputTypes.ts";
import { sourceMatches } from "./InputTypes.ts";

/**
 * Maps raw input events to named actions (Godot-style InputMap).
 * Providers call {@link dispatch}; gameplay listens with {@link onAction}.
 */
export class InputMap {
  private readonly bindings: InputBinding[] = [];
  private readonly listeners = new Set<ActionListener>();

  register(binding: InputBinding): void {
    this.bindings.push(binding);
    debugLog("InputMap.register", binding);
  }

  registerAll(bindings: readonly InputBinding[]): void {
    for (const binding of bindings) {
      this.register(binding);
    }
  }

  /** Raw device event → zero or more action callbacks. */
  dispatch(event: RawInputEvent): void {
    for (const binding of this.bindings) {
      if (!sourceMatches(binding.source, event.source)) {
        continue;
      }
      debugLog("InputMap.dispatch", {
        action: binding.action,
        phase: event.phase,
        source: event.source,
      });
      for (const listener of this.listeners) {
        listener(binding.action, event.phase, event);
      }
    }
  }

  onAction(listener: ActionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    this.bindings.length = 0;
    this.listeners.clear();
  }
}

export type { InputPhase, MenuSlotAction, RawInputEvent };
