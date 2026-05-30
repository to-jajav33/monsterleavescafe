import type { InputBinding } from "./InputTypes.ts";

/** Default menu pour bindings — keys 1–3 + pointer pick on each slot mesh. */
export const DEFAULT_MENU_INPUT_BINDINGS: readonly InputBinding[] = [
  { source: { kind: "keyboard", key: "1" }, action: "menu_slot_1" },
  { source: { kind: "keyboard", key: "2" }, action: "menu_slot_2" },
  { source: { kind: "keyboard", key: "3" }, action: "menu_slot_3" },
  { source: { kind: "menu_pointer", slot: 1 }, action: "menu_slot_1" },
  { source: { kind: "menu_pointer", slot: 2 }, action: "menu_slot_2" },
  { source: { kind: "menu_pointer", slot: 3 }, action: "menu_slot_3" },
] as const;
