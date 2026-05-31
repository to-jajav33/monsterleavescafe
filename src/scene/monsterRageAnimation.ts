import type { LayoutPlane } from "./LayoutPlane.ts";
import {
  BIGFOOT_IDLE_FRAMES,
  BIGFOOT_IDLE_URL,
} from "./monsterBigfootAssets.ts";
import {
  MEDUSA_IDLE_FRAMES,
  MEDUSA_IDLE_URL,
} from "./monsterMedusaAssets.ts";
import {
  SLIME_IDLE_FRAMES,
  SLIME_IDLE_URL,
} from "./monsterSlimeAssets.ts";
import type { CustomerAppearance } from "./SeatCustomer.ts";
import { debugLog } from "../utils/debugLog.ts";

/** Boss forgive window — alternate angry frames for this duration (GAME_SCOPE). */
export const RAGE_ANGER_DURATION_SEC = 0.5;

const ANGRY_FLIP_COUNT = 4;
const ANGRY_FLIP_INTERVAL_MS =
  (RAGE_ANGER_DURATION_SEC / ANGRY_FLIP_COUNT) * 1000;

export type MonsterRageFrameSet = {
  idle: string;
  angry: readonly string[];
  jumpScare: string;
};

const RAGE_FRAMES: Partial<
  Record<"slime_idle" | "medusa_idle" | "bigfoot_idle", MonsterRageFrameSet>
> = {
  slime_idle: {
    idle: SLIME_IDLE_URL,
    angry: [SLIME_IDLE_FRAMES.angry1, SLIME_IDLE_FRAMES.angry2],
    jumpScare: SLIME_IDLE_FRAMES.jumpScare,
  },
  medusa_idle: {
    idle: MEDUSA_IDLE_URL,
    angry: [MEDUSA_IDLE_FRAMES.angry1],
    jumpScare: MEDUSA_IDLE_FRAMES.jumpScare,
  },
  bigfoot_idle: {
    idle: BIGFOOT_IDLE_URL,
    angry: [BIGFOOT_IDLE_FRAMES.angry1, BIGFOOT_IDLE_FRAMES.angry2],
    jumpScare: BIGFOOT_IDLE_FRAMES.jumpScare,
  },
};

export function monsterRageFrames(
  appearance: CustomerAppearance,
): MonsterRageFrameSet | null {
  if (
    appearance !== "slime_idle" &&
    appearance !== "medusa_idle" &&
    appearance !== "bigfoot_idle"
  ) {
    return null;
  }
  return RAGE_FRAMES[appearance] ?? null;
}

export type RageOutPlayback = {
  cancel: () => void;
};

/**
 * 0.5s angry flip (angry1 ↔ angry2), then hold jumpscare until cancelled or idle restore.
 */
export function playMonsterRageOut(
  body: LayoutPlane,
  frames: MonsterRageFrameSet,
  hooks?: { onAngerComplete?: () => void },
): RageOutPlayback {
  const angryUrls = frames.angry;
  let flipIndex = 0;
  let flipTimer: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  const clearFlipTimer = (): void => {
    if (flipTimer !== null) {
      globalThis.clearTimeout(flipTimer);
      flipTimer = null;
    }
  };

  const showAngryFrame = (): void => {
    if (cancelled) {
      return;
    }
    const url = angryUrls[flipIndex % angryUrls.length]!;
    body.setImageUrl(url);
    flipIndex += 1;
    if (flipIndex < ANGRY_FLIP_COUNT) {
      flipTimer = globalThis.setTimeout(showAngryFrame, ANGRY_FLIP_INTERVAL_MS);
      return;
    }
    clearFlipTimer();
    body.setImageUrl(frames.jumpScare);
    hooks?.onAngerComplete?.();
    debugLog("MonsterRageAnimation: jumpscare", { jumpScare: frames.jumpScare });
  };

  debugLog("MonsterRageAnimation: angry start", {
    durationSec: RAGE_ANGER_DURATION_SEC,
    flips: ANGRY_FLIP_COUNT,
  });
  showAngryFrame();

  return {
    cancel: () => {
      cancelled = true;
      clearFlipTimer();
    },
  };
}

export function restoreMonsterIdle(body: LayoutPlane, frames: MonsterRageFrameSet): void {
  body.setImageUrl(frames.idle);
}
