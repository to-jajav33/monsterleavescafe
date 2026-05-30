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
