import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { Vec2 } from "../utils/math.ts";

/** Scene art served from `index.ts` routes. */
export const SCENE_BACKGROUND_URL = "/assets/image-bg.png";
export const SCENE_COUNTER_TOP_URL = "/assets/image-counter-top.png";
export const GHOST_NPC_URL = "/assets/image-ghost-npc.png";

/** Native pixels of `image-ghost-npc.png`. */
export const GHOST_NPC_NATIVE = {
  width: 234,
  height: 604,
} as const;

/** Window / mid-wall placement (behind table, in front of bg). */
export const GHOST_NPC_CENTER = new Vec2(-40, 45);

export const GHOST_NPC_DISPLAY_HEIGHT = 360;
export const GHOST_NPC_DISPLAY_WIDTH =
  GHOST_NPC_DISPLAY_HEIGHT * (GHOST_NPC_NATIVE.width / GHOST_NPC_NATIVE.height);

/** Overall sprite transparency (0–1). */
export const GHOST_NPC_OPACITY = 0.58;

export const GHOST_NPC_HOVER_AMPLITUDE = 10;
export const GHOST_NPC_HOVER_DURATION_SEC = 2.4;

/** Native pixels of `image-counter-top.png` (aspect ratio). */
export const COUNTER_TOP_NATIVE = {
  width: 1299,
  height: 691,
} as const;

/**
 * On the `image-bg` mockup, count brick rows from the back-wall baseboard down.
 * The cream counter-top edge sits on the seam **below the 8th row** (8 full rows
 * of floor visible between wall and counter).
 */
export const COUNTER_TOP_BRICK_ROW_FROM_BACK_WALL = 8;

/**
 * Counter-top **upper** edge in design space: **25% up from the bottom** of the
 * 1280×720 frame (same as **75% down from the top**).
 *
 * `y = orthoBottom + 0.25 × DESIGN_HEIGHT = -360 + 180 = -180`
 */
export const COUNTER_TOP_EDGE_Y = -DESIGN_HEIGHT / 2 + DESIGN_HEIGHT * 0.25;

export const COUNTER_TOP_WIDTH = DESIGN_WIDTH;
export const COUNTER_TOP_HEIGHT =
  COUNTER_TOP_WIDTH * (COUNTER_TOP_NATIVE.height / COUNTER_TOP_NATIVE.width);

/** Plane center so the texture's top edge sits on {@link COUNTER_TOP_EDGE_Y}. */
export const COUNTER_TOP_CENTER = new Vec2(
  0,
  COUNTER_TOP_EDGE_Y - COUNTER_TOP_HEIGHT / 2,
);

/** `image-flashlight.png` — decal on under-counter shelf (hide / backroom area). */
export const FLASHLIGHT_URL = "/assets/image-flashlight.png";

export const FLASHLIGHT_NATIVE = {
  width: 272,
  height: 140,
} as const;

/** Middle shelf on counter front (right alcove, below cream top). */
export const FLASHLIGHT_SHELF_CENTER = new Vec2(220, -402);

export const FLASHLIGHT_DISPLAY_WIDTH = 96;
export const FLASHLIGHT_DISPLAY_HEIGHT =
  FLASHLIGHT_DISPLAY_WIDTH *
  (FLASHLIGHT_NATIVE.height / FLASHLIGHT_NATIVE.width);

/** Lay diagonally on shelf (asset head is toward bottom-left). */
export const FLASHLIGHT_ROTATION_Z = -0.42;
