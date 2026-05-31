import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { Vec2 } from "../utils/math.ts";

import { SCENE_BACKGROUND_URL } from "./sceneAssets.ts";

export const TUTORIAL_BACKGROUND_URL = SCENE_BACKGROUND_URL;

export const TUTORIAL_BOSS_URL = "/assets/image-boss-tutorial.png";
export const TUTORIAL_BUTTON_NEXT_URL = "/assets/image-button-next.png";
export const TUTORIAL_BUTTON_START_SHIFT_URL =
  "/assets/image-button-start-shift.png";

export const TUTORIAL_BOSS_NATIVE = {
  width: 1370,
  height: 771,
} as const;

export const TUTORIAL_BUTTON_NATIVE = {
  width: 512,
  height: 512,
} as const;

export const TUTORIAL_START_SHIFT_NATIVE = {
  width: 773,
  height: 773,
} as const;

/** Boss tutorial art fills the design frame (artist request). */
export const TUTORIAL_BOSS_CENTER = new Vec2(0, 0);
export const TUTORIAL_BOSS_DISPLAY_WIDTH = DESIGN_WIDTH;
export const TUTORIAL_BOSS_DISPLAY_HEIGHT = DESIGN_HEIGHT;

export const TUTORIAL_BUTTON_WIDTH = 175;
export const TUTORIAL_START_SHIFT_WIDTH = 280;
export const TUTORIAL_BUTTON_HEIGHT =
  TUTORIAL_BUTTON_WIDTH *
  (TUTORIAL_BUTTON_NATIVE.height / TUTORIAL_BUTTON_NATIVE.width);
export const TUTORIAL_START_SHIFT_HEIGHT =
  TUTORIAL_START_SHIFT_WIDTH *
  (TUTORIAL_START_SHIFT_NATIVE.height / TUTORIAL_START_SHIFT_NATIVE.width);

export const TUTORIAL_TEXT_BOX_CENTER = new Vec2(300, 30);
export const TUTORIAL_TEXT_BOX_SIZE = {
  width: 400,
  height: 440,
} as const;

export const TUTORIAL_LABEL_FONT = "bold 28px monospace";
export const TUTORIAL_LABEL_PADDING = 26;

export const TUTORIAL_BUTTON_START_SHIFT_CENTER = new Vec2(175, -210);
export const TUTORIAL_BUTTON_NEXT_CENTER = new Vec2(385, -210);

export const TUTORIAL_FRAME_SIZE = {
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
} as const;

export const TUTORIAL_PROMPTS = [
  "To serve drinks to monsters, Press+Hold 1, 2, or 3",
  "If you can't serve monsters fast enough, lights out for us! You get 3 tries newbie.",
  "Oh and by the way, make sure you hide when medusa's eyes are about to glow. Or you'll be stoned. Press and Hold Space to Hide, until its safe to come out",
] as const;
