/** Logical gameplay actions (like Godot InputMap action names). */
export type MenuSlotAction = "menu_slot_1" | "menu_slot_2" | "menu_slot_3";

export type InputPhase = "pressed" | "released";

/** Physical / device input before it is mapped to an action. */
export type InputSource =
  | { kind: "keyboard"; key: string }
  | { kind: "menu_pointer"; slot: 1 | 2 | 3 };

export type RawInputEvent = {
  source: InputSource;
  phase: InputPhase;
};

export type InputBinding = {
  source: InputSource;
  action: MenuSlotAction;
};

export type ActionListener = (
  action: MenuSlotAction,
  phase: InputPhase,
  event: RawInputEvent,
) => void;

export function menuSlotActionToSlot(action: MenuSlotAction): 1 | 2 | 3 {
  switch (action) {
    case "menu_slot_1":
      return 1;
    case "menu_slot_2":
      return 2;
    case "menu_slot_3":
      return 3;
  }
}

export function slotToMenuSlotAction(slot: 1 | 2 | 3): MenuSlotAction {
  return `menu_slot_${slot}` as MenuSlotAction;
}

export function sourceMatches(a: InputSource, b: InputSource): boolean {
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind === "keyboard" && b.kind === "keyboard") {
    return a.key === b.key;
  }
  if (a.kind === "menu_pointer" && b.kind === "menu_pointer") {
    return a.slot === b.slot;
  }
  return false;
}
