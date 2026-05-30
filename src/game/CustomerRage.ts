/** Rage ramp 0→1 over {@link patienceSeconds}; order locks at 50%. */
export class CustomerRage {
  private elapsed = 0;
  private _atFull = false;

  constructor(readonly patienceSeconds: number) {}

  get percent(): number {
    return Math.min(1, this.elapsed / this.patienceSeconds);
  }

  /** Order mind-change allowed only below 50% rage (GAME_SCOPE). */
  get orderLocked(): boolean {
    return this.percent >= 0.5;
  }

  get atFullRage(): boolean {
    return this._atFull;
  }

  tick(deltaSeconds: number): void {
    if (this._atFull) {
      return;
    }
    this.elapsed += deltaSeconds;
    if (this.percent >= 1) {
      this._atFull = true;
      this.elapsed = this.patienceSeconds;
    }
  }

  reset(): void {
    this.elapsed = 0;
    this._atFull = false;
  }
}
