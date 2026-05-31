/**
 * 2D draw order (renderingGroupId). Higher = on top.
 *
 * Babylon only renders groups 0–3 (RenderingManager.MAX_RENDERINGGROUPS = 4).
 * Do not use layer 4+ or meshes will never appear.
 */
export const LayoutLayer = {
  backWall: 0,
  decor: 1,
  seats: 2,
  counter: 3,
  /** Menu, drink slots, Hide, BOSS — must share group 3; use depthOffset / build order for stacking */
  ui: 3,
} as const;

/**
 * Z nudge within a layer (`mesh.z = layer * 0.1 + offset`). Higher = drawn on top.
 *
 * Counter **art** uses {@link LayoutLayer.seats} (group 2), not group 3 — Babylon
 * draws transparent PNGs after opaque meshes in the same group, which buried the menu.
 * Group 3 UI always renders after group 2. Within group 2, use
 * {@link LayoutAlphaIndex.monsterBody} &lt; {@link LayoutAlphaIndex.counterTop}
 * &lt; {@link LayoutAlphaIndex.seatContent} so bodies sit behind the bar.
 */
export const LayoutZOffset = {
  /** Customer bodies on seats layer → z = 0.27 (behind counter top). */
  monsterBody: 0.07,
  /** Z nudge by seat — R back, L front (pairs with monsterBodySeat* alphaIndex). */
  monsterBodySeatR: 0.07,
  monsterBodySeatC: 0.075,
  monsterBodySeatL: 0.08,
  /** On seats layer → z = 0.29 (above monsters, below order bubbles). */
  counterTop: 0.09,
  /** Above monster body, below rage overlay. */
  orderBubble: 0.11,
  rageBubble: 0.14,
  /** Under-counter shelf decals (flashlight on hide shelf). */
  shelfDecal: 0.095,
  menuBoard: 0,
  menuTitle: 0.01,
  menuSlot: (slot: 1 | 2 | 3) => 0.02 + slot * 0.01,
  hide: 0.05,
  boss: 0.06,
} as const;

/** Transparent-pass sort: higher draws on top within the same rendering group. */
export const LayoutAlphaIndex = {
  background: 0,
  ghostNpc: 5,
  /** Monsters — drawn before counter top within group 2. */
  monsterBody: 5,
  /** Queue overlap paint order: R (back) → C → L (front). */
  monsterBodySeatR: 5,
  monsterBodySeatC: 6,
  monsterBodySeatL: 7,
  counterTop: 10,
  shelfDecal: 12,
  /** Legacy alias — prefer orderBubble / rageBubble. */
  seatContent: 20,
  /** Draw stack: monsterBody < orderBubble < rageBubble (within group 2). */
  orderBubble: 21,
  rageBubble: 22,
  menuBoard: 100,
  menuTitle: 101,
  menuSlot: (slot: 1 | 2 | 3) => 102 + slot,
  hide: 110,
  boss: 111,
} as const;
