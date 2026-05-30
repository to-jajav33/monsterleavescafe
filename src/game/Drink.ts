import { Color3 } from "@babylonjs/core/Maths/math.color";

/** Menu drink — hold duration from GAME_SCOPE (blood < brew < eyeball). */
export class Drink {
  constructor(
    readonly slot: 1 | 2 | 3,
    readonly name: string,
    readonly shortLabel: string,
    readonly holdDurationSeconds: number,
    readonly menuColor: Color3,
  ) {}
}

export const DRINK_MENU: readonly Drink[] = [
  new Drink(
    1,
    "Eyeball drink",
    "Eyeball",
    2.5,
    new Color3(0.55, 0.72, 0.45),
  ),
  new Drink(
    2,
    "Blood (O-negative)",
    "Blood",
    1.0,
    new Color3(0.72, 0.28, 0.32),
  ),
  new Drink(
    3,
    "Witch brew",
    "Witch brew",
    1.5,
    new Color3(0.48, 0.35, 0.72),
  ),
] as const;

export function getDrinkBySlot(slot: 1 | 2 | 3): Drink {
  const drink = DRINK_MENU.find((d) => d.slot === slot);
  if (!drink) {
    throw new Error(`Unknown drink slot: ${slot}`);
  }
  return drink;
}
