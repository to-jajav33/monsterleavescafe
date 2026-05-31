import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { Vec2 } from "../utils/math.ts";

export const TITLE_PAGE_URL = "/assets/image-title-page.png";
export const TITLE_BUTTON_START_URL = "/assets/image-button-start.png";
export const TITLE_BUTTON_QUIT_URL = "/assets/image-button-quit.png";

export const TITLE_PAGE_NATIVE = {
  width: 1189,
  height: 669,
} as const;

export const TITLE_BUTTON_NATIVE = {
  width: 512,
  height: 512,
} as const;

/** Shown size in design units (mockup right-side buttons). */
export const TITLE_BUTTON_DISPLAY_WIDTH = 200;
export const TITLE_BUTTON_DISPLAY_HEIGHT =
  TITLE_BUTTON_DISPLAY_WIDTH *
  (TITLE_BUTTON_NATIVE.height / TITLE_BUTTON_NATIVE.width);

/** Slight tilt baked into button art — match mockup. */
export const TITLE_BUTTON_ROTATION_Z = 0.06;

/**
 * Button placement from title mockup — right column, Start above Quit.
 * Tune centers if assets shift.
 */
export const TITLE_BUTTON_START_CENTER = new Vec2(420, 50);
export const TITLE_BUTTON_QUIT_CENTER = new Vec2(420, -100);

/** Full-frame title art (1280×720 design space). */
export const TITLE_PAGE_CENTER = new Vec2(0, 0);
export const TITLE_PAGE_SIZE = {
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
} as const;
