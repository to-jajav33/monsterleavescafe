import type { LivesHud } from "../scene/LivesHud.ts";
import {
  STARTING_LIVES,
  type LivesCount,
} from "../scene/livesAssets.ts";
import { debugLog } from "../utils/debugLog.ts";

/**
 * Strike budget — each rage-out jumpscare costs one life (GAME_SCOPE: 3 strikes).
 */
export class LivesController {
  private remaining = STARTING_LIVES;

  constructor(private readonly hud: LivesHud) {}

  get livesRemaining(): number {
    return this.remaining;
  }

  /** @returns true if no lives remain after this loss */
  loseLife(): boolean {
    if (this.remaining <= 0) {
      return true;
    }
    this.remaining -= 1;
    this.hud.setLives(this.remaining as LivesCount);
    this.hud.flashLoss();
    debugLog("LivesController: life lost", { remaining: this.remaining });
    return this.remaining <= 0;
  }

  reset(): void {
    this.remaining = STARTING_LIVES;
    this.hud.setLives(STARTING_LIVES);
  }
}
