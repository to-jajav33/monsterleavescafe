/** Base monster — patience drives rage timing (used in later phases). */
export abstract class Monster {
  constructor(readonly patienceSeconds: number) {}
}

/** Placeholder customer until art and types exist. */
export class PlaceholderMonster extends Monster {
  constructor(patienceSeconds: number = 25) {
    super(patienceSeconds);
  }
}

/** Slime customer — queue patience tuned for first playable pass. */
export class SlimeMonster extends Monster {
  constructor(patienceSeconds: number = 28) {
    super(patienceSeconds);
  }
}

/** Medusa customer — queue at center seat. */
export class MedusaMonster extends Monster {
  constructor(patienceSeconds: number = 28) {
    super(patienceSeconds);
  }
}
